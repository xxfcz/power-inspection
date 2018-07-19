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

function calcGreatCircleDistance(lat1, lng1, lat2, lng2) {
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


function getCurrentPosition(){
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve({
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude
          })
        },
        err => {
          reject(err.message)
        }
      )
    } else {
      reject('您的浏览器不支持地理定位！')
    }
  })
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = e => {
      resolve(e.target.result)
    }
    reader.onerror = e =>{
      reject(e)
    }
    reader.readAsDataURL(file)
  })
}

function getUser(){
  return JSON.parse(localStorage.getItem('user'))
}

function getToken(){
  return localStorage.getItem('token')
}

export default {
  /**
 * caculate the distance
 * @param {Object} lat1
 * @param {Object} lng1
 * @param {Object} lat2
 * @param {Object} lng2
 */
  calcDistance: calcGreatCircleDistance,
  getCurrentPosition: getCurrentPosition,
  readImage: readImage,
  getUser,
  getToken
}
