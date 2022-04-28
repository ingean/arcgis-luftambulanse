
import SpatialReference from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/SpatialReference.js'
import * as locator from 'https://js.arcgis.com/4.22/@arcgis/core/rest/locator.js'
import * as projection from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/projection.js'


export default class MapLocation {
  async #geocodeReverse(point) {
    let response = await locator.locationToAddress(this.locatorUrl, {location: point})
    return response.attributes.ShortLabel
  }

  async #getLatLon(point) {
    let outSpatialReference = new SpatialReference({
      wkid: 4326 // WGS84
    })

    await projection.load()  
    return projection.project(point, outSpatialReference)
  }

  constructor(mapPoint) {
    this.locatorUrl = 'http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer'
    this.point = mapPoint
    this.geoPoint = this.#getLatLon(this.point)  
    this.address = this.#geocodeReverse(this.point)
  }
}