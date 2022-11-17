import { createElement } from "./Element.js"
import * as Time from './Time.js'

export const ganttResource = (results) => {
  addPanel('result-timeline-row')
  let start = dayjs()  
  let data = []
  results.forEach((result, i) => {
    data.push(resultToGanttRange(start, i, result))
  })

  let chart = anychart.ganttResource()
  formatChart(chart)
  addLegend()

  let treeData = anychart.data.tree(data, "as-table") 
  chart.data(treeData)
  chart.container('timeline-container').draw()
  chart.fitAll()
}

const addPanel = (container) => {
  let resultTimelineRow = document.getElementById(container)
  resultTimelineRow.innerHTML = ''
  
  const panel = createElement('calcite-panel', 
    {
      heading: "Resultat",
      closable: true,
      heightScale: "l",
      intlClose: "Lukk"
    },[
      createElement('div', {id:"timeline-container"}),
      createElement('div', {id:"legend-container"})
    ]
  )

  panel.addEventListener('calcitePanelClose', e => {resultTimelineRow.hidden = true})

  resultTimelineRow.hidden = false
  resultTimelineRow.appendChild(panel)
}

const resultToGanttRange = (start, i, result) => {
  let react = start.add(result.Reaction, 'minute')
  let flightTo = react.add(result.flighttimeminutes, 'minute')
  let rescue = flightTo.add(result.Rescue, 'minute')
  let doc = flightTo.add(result.Doc, 'minute')
  let flightFrom = doc.add(result.returntimeminutes, 'minute') 
  
  return {
    id: i,
    name: `${result.station}: ${Time.minutesToHours(result.totaltime)}`,
    periods: [
      period(`${i}-1`, 'Reaksjonstid', result.Reaction, start, react, '#36DA43'),
      period(`${i}-2`, 'Flytid til hendelse', result.flighttimeminutes, react, flightTo, '#00A0FF'),
      period(`${i}-3`, 'Tid til redning', result.Rescue, flightTo, rescue), '#FFC900',
      period(`${i}-4`, 'Tid til lege', result.Doc, flightTo, doc, '#FF0015'),
      period(`${i}-5`, `Flytid til ${result.hospital}`, result.returntimeminutes, doc, flightFrom, '#00A0FF')
    ]
  }
}

const period = (id, name, duration, start, end, color) => {
  return {
    id: id, 
    name: name,
    duration: duration,
    start: start.toDate(), 
    end: end.toDate(),
    fill: color,
    marker: "Test"
  }
}

const formatChart = (chart) => {
  chart.height('300px')
  chart.splitterPosition(223)
  chart.background({fill: "#353535"})

  let dataGrid = chart.dataGrid()
  dataGrid.headerFill("#353535")
  //dataGrid.fontColor("#FFFFFF")

  let timeLine = chart.getTimeline()
  timeLine.rowHoverFill("#BFBFBF");
  timeLine.rowSelectedFill("#00619B");
  timeLine.columnStroke(null);

  let timeLineHeader = timeLine.header()
  timeLineHeader.background({fill: "#353535"})
  timeLineHeader.fontColor("#FFFFFF")

  let tooltip = timeLine.tooltip()
  tooltip.useHtml(true)
  tooltip.format(
    "<span style='font-weight:600;font-size:12pt'>" +
    "{%start}{dateTimeFormat:HH:mm} - " +
    "{%end}{dateTimeFormat:HH:mm}</span><br><br>" +
    "Varighet {%duration} min"
  )
}

const addLegend = () => {
  let legend = createElement('div', 'gantt-legend', [
    createElement('div', 'legend-text', 'Reaksjonstid'),
    createElement('div', 'legend-color legend-color-1', ''),
    createElement('div', 'legend-text', 'Transporttid'),
    createElement('div', 'legend-color legend-color-2', ''),
    createElement('div', 'legend-text', 'Redningstid'),
    createElement('div', 'legend-color legend-color-3', '')
  ])

  document.getElementById('legend-container').appendChild(legend)
}

