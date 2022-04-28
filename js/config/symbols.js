export const lineSymbol = {
  type: "simple-line",  // autocasts as SimpleLineSymbol()
  color: [191,191,191],
  width: 4
}

export const closestLineSymbol = {
  type: "simple-line",  // autocasts as SimpleLineSymbol()
  color: [0,154,242],
  width: 4
}

export const markerSymbol = {
  type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
  style: "square",
  color: "blue",
  size: "8px",  // pixels
  outline: {  // autocasts as new SimpleLineSymbol()
    color: [ 255, 255, 0 ],
    width: 3  // points
  }
}

export const webStyleSymbol = {
  type: "web-style",  // autocasts as new WebStyleSymbol()
  name: "flag",
  styleName: "Esri2DPointSymbolsStyle"
}