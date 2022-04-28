import Portal from 'https://js.arcgis.com/4.22/@arcgis/core/portal/Portal.js'
import esriConfig from 'https://js.arcgis.com/4.22/@arcgis/core/config.js'
import WebMap from 'https://js.arcgis.com/4.23/@arcgis/core/WebMap.js'
import MapView from 'https://js.arcgis.com/4.23/@arcgis/core/views/MapView.js'
import GraphicsLayer from 'https://js.arcgis.com/4.23/@arcgis/core/layers/GraphicsLayer.js'

import ActionBar from './ui/ActionBar.js'
import MapTheme from './ui/MapTheme.js'
import * as Rescuetime from './RescueTime.js'
import MapLocation from './utils/MapLocation.js'

esriConfig.apiKey = 'AAPKf28ba4fdd1e945a1be5f8d43dbd650eaMjyiDjdFXaCPZzo5erYJ7Xc7XKvBlbJZIPvNu0O2zwfeFiGhqoBvtQwJUZ1DMXIL'

let portal = new Portal({
  url: "https://www.arcgis.com" // First instance
})

const webmapId = 'a797cd04e22f4e6694b5790a1c12bcb1' // Publicly available webmap
const theme = new MapTheme() // Contains light and dark basemap

let incidentLayer = new GraphicsLayer({title: "Hendelse"})
let resultsLayer = new GraphicsLayer({title: "Helikopterruter"})

const map = new WebMap({
  portalItem: {
    id: webmapId
  }
})

map.add(resultsLayer)
map.add(incidentLayer)

await map.load();

const view = new MapView({
  map,
  container: "viewDiv",
  padding: {
    left: 49
  }
})

let analysisSettings = {
  view,
  incidentLayer,
  resultsLayer
}

map.when(() => {  
  map.allLayers.items[3].queryFeatures({
    where: '1=1',
    returnGeometry: true,
    outFields: ["*"],
  })
  .then(featureSet => {
    Rescuetime.populateHospitals('hospitals', featureSet.features, view)
  })

  map.allLayers.items[2].queryFeatures({
    where: '1=1',
    returnGeometry: true,
    outFields: ["*"],
  })
  .then(featureSet => {
    Rescuetime.settings({
      ...analysisSettings,
      stations: featureSet.features
    })
  })  
})  

view.on("click", event => {
  if (!addIncidentIsActive()) return
  Rescuetime.addIncident(new MapLocation(event.mapPoint))
})

const addIncidentIsActive = () => {
  return document.querySelector('#add-mappoint').active
}

document.querySelector('#add-mappoint')
.addEventListener('click', event => {
  event.target.active =  !event.target.active
})


const actionBar = new ActionBar(view, 'findresource')

const { title, description, thumbnailUrl, avgRating } = map.portalItem
document.querySelector("#header-title").textContent = title
document.querySelector("calcite-shell").hidden = false
document.querySelector("calcite-loader").active = false