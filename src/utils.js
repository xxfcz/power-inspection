var EARTH_RADIUS = 6378137.0 //单位M
var PI = Math.PI

function getRad(d) {
  return d * PI / 180.0
}

/**
 * caculate the great circle distance
 * @param {Object} lat1
 * @param {Object} lng1
 * @param {Object} lat2
 * @param {Object} lng2
 */

function getGreatCircleDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = getRad(lat1)
  var radLat2 = getRad(lat2)

  var a = radLat1 - radLat2
  var b = getRad(lng1) - getRad(lng2)

  var s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    )
  s = s * EARTH_RADIUS
  s = Math.round(s * 10000) / 10000.0

  return s
}

/* File处理 */


export default {
  getDistance: getGreatCircleDistance
}
