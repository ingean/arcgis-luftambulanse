import * as geometryEngine from 'https://js.arcgis.com/4.23/@arcgis/core/geometry/geometryEngine.js'
import Polyline from 'https://js.arcgis.com/4.23/@arcgis/core/geometry/Polyline.js'
import Graphic from 'https://js.arcgis.com/4.23/@arcgis/core/Graphic.js'
import { createElement } from './utils/Element.js'
import * as Time from './utils/Time.js'
import { stationLinesPopupTemplate, hospitalLinePopupTemplate } from './config/popups.js'
import { lineSymbol, closestLineSymbol, webStyleSymbol } from './config/symbols.js'
import * as Alert from './utils/Alert.js'

let view = null
let incidentLayer = null
let resultsLayer = null
let stations = null
let incident = null
let hospitals = null


document.getElementById('hospitals-list')
.addEventListener('calciteListChange', event => {
  if (!incident) return
  solve(incident)
})

export const settings = (params) => {
  view = params.view,
  incidentLayer = params.incidentLayer
  resultsLayer = params.resultsLayer
  stations = params.stations
}

export const addIncident = async (mapLocation) => {
  incident = mapLocation.point
  let list = document.querySelector(`#incident-list`)
  list.innerHTML = '' // Remove previous incident from list
  incidentLayer.removeAll() // Remove previous incident from map

  let action =  createAction('layer-zoom-to')
  action.addEventListener('click', event => view.goTo(incident))

  let geoPoint = await mapLocation.geoPoint

  let item = createListItem(await mapLocation.address, `Lengdegrad: ${geoPoint.x.toFixed(2)} Breddegrad: ${geoPoint.y.toFixed(2)}`, '', action)
  list.appendChild(item)

  let graphic = createGraphic(mapLocation.point)
  incidentLayer.add(graphic)

  solve(incident)
}

export const populateHospitals = (id, features, view) => {
  hospitals = features
  let list = document.querySelector(`#${id}-list`)

  features.forEach((feature, idx) => {
    let action =  createAction('layer-zoom-to')
    action.addEventListener('click', event => view.goTo(feature.geometry))

    let item = createListItem(feature.attributes.Name, feature.attributes.Category, idx, action, true)
    list.appendChild(item)
  })
}

const createAction = (icon) => {
  return createElement('calcite-action', {
    slot: 'actions-end',
    icon
  })
}

const createListItem = (label, descr, value, action, isPickList = false) => {
  let type = (isPickList) ? 'calcite-pick-list-item' : 'calcite-list-item'
  return createElement(type, { 
    label,
    ...(descr && { description: descr }), // Only add description if not null or undefined
    value
    },
    action
  )
}

const createResultSection = (result) => {
  let totaltime = Time.minutesToHours(result.totaltime)
  let btn = createElement('calcite-button', {color: 'neutral', "icon-start": "layer-zoom-to"})
  btn.addEventListener('click', event => view.goTo(result.geometry))

  return createElement('calcite-block-section', {text: `${result.station} (${totaltime})`}, 
          createElement('calcite-card', '', [
            createElement('div', '', [
              createElement('div', '', `Avstand til hendelse: ${result.distance} km`),
              createElement('div', '', `Flytid til hendelse: ${result.flighttime}`),
              createElement('div', '', `Tid til pasientkontakt (redningspersonell): ${result.rescuetime}`),
              createElement('div', '', `Tid til pasientkontakt (lege): ${result.firstrespondertime}`),
              createElement('div', '', `Flytid til ${result.hospital}: ${result.returntime}`),
              createElement('div', '', `Total oppdragstid: ${Time.minutesToHours(result.totaltime)}`)
            ]),
            createElement('div', {slot: 'footer-trailing'}, [
              btn
            ])
          ])
  )
}

const solve = async (incident) => {
  resultsLayer.removeAll() // Remove previous results from map
  let selectedHospital = await document.querySelector('#hospitals-list').getSelectedItems()
  selectedHospital = [...selectedHospital]
  
  if (selectedHospital.length === 0) { 
    Alert.show({
      color: 'red', 
      title: 'Velg akuttmottak', 
      message: 'Velg akuttmottak som skal benyttes for hendelsen for å utføre analysen', 
      containerId: 'resource-alert-container',
      icon: 'organization' 
    })
    return
  }

  let hospitalIndex = parseInt(selectedHospital[0][0])

  let hospital = hospitals[hospitalIndex]
  let results = []
  
  stations.forEach(station => {
    let toIncidentGraphic = createLineGraphics(station.geometry, incident, station.attributes)
    toIncidentGraphic.popupTemplate = stationLinesPopupTemplate
    addToAttributes(toIncidentGraphic, station.attributes)

    let fromIncidentGraphic = createLineGraphics(incident, hospital.geometry, station.attributes)
    addFromAttributes(fromIncidentGraphic, station.attributes.Name, hospital.attributes.Name, station.attributes.Speed)
    fromIncidentGraphic.popupTemplate = hospitalLinePopupTemplate
    
    results.push({
      toGraphic: toIncidentGraphic,
      fromGraphic: fromIncidentGraphic,
      geometry: mergeLines([toIncidentGraphic.geometry, fromIncidentGraphic.geometry]),
      ...toIncidentGraphic.attributes,
      ...fromIncidentGraphic.attributes,
      totaltime: toIncidentGraphic.attributes.flighttimeminutes + fromIncidentGraphic.attributes.returntimeminutes + station.attributes.Empirical
    })
  })

  results.sort((a, b) => a.totaltime - b.totaltime)
  view.goTo(results[0].geometry)
  updateLineSymbols(results)
  addResultsToList(results)
} 

const updateLineSymbols = (results) => {
  results.forEach((result, idx) => {
    if (idx === 0) result.toGraphic.symbol = closestLineSymbol
    result.fromGraphic.symbol = closestLineSymbol
    resultsLayer.addMany([result.toGraphic, result.fromGraphic])
  })
}

const addResultsToList = (results) => {
  let block = document.querySelector(`#results-block-container`)
  block.innerHTML = '' // Remove previous results from list
  
  results.forEach(result => {
    let action =  createAction('layer-zoom-to')
    action.addEventListener('click', event => view.goTo(result.geometry))
  
    let section = createResultSection(result)
    block.appendChild(section)
  })
}

const createLineGraphics = (startpoint, endpoint, params) => {
  let line = lineFromPoints([startpoint, endpoint])
  return createGraphic(line, params)
}

const addToAttributes = (graphic, params) => {
  let planarLength = geometryEngine.planarLength(graphic.geometry)
  let flighttime =  calcTime(planarLength, params.Speed) 

  graphic.attributes = {
    station: params.Name,
    distance: Number((planarLength / 1000).toFixed(1)),
    flighttime: Time.minutesToHours(flighttime),
    flighttimeminutes: Math.round(flighttime),
    rescuetime: Time.minutesToHours(flighttime + params.Reaction + params.Rescue),
    firstrespondertime: Time.minutesToHours(flighttime + params.Reaction + params.Doc)
  }
  return graphic
}

const addFromAttributes = (graphic, station, name, speed) => {
  let planarLength = geometryEngine.planarLength(graphic.geometry)
  let returntime = calcTime(planarLength, speed)

  graphic.attributes = {
    origin: station,
    hospital: name,
    returndistance: Number((planarLength/1000).toFixed(1)),
    returntime: Time.minutesToHours(returntime),
    returntimeminutes: Math.round(returntime)
  }
  return graphic
}

const createGraphic = (geometry) => {
  return new Graphic({
    geometry,
    symbol: geometry.type == 'point' ? webStyleSymbol : lineSymbol,
  })
}

const lineFromPoints = (points, wkid) => {
  return new Polyline({
    spatialReference: {wkid},
    paths: [points.map(point => [point.x, point.y])]
  })
}

const calcTime = (length, speed) => {
  let lengthKM = length / 1000
  return ((lengthKM / speed) * 60) 
}

const mergeLines = (lines, wkid = 25833) => {
  return new Polyline({
    spatialReference: {wkid},
    paths: lines.map(line => line.paths[0])
  })
}