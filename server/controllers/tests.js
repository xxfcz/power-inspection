const express = require('express')
const router = express.Router()
const XLSX = require('xlsx')
const fs = require('fs')
const os = require('os')
const path = require('path')

const xutils = require('../xutils')

router.get('/hello', (req, res) => {
  console.log(req.user)
  res.send('Hello, World!')
})

router.post('/body', (req, res) => {
  res.send(req.body)
})

router.post('/token', (req, res) => {
  res.json({
    ok: true,
    token: jwt.sign(
      {
        name: 'tester',
        data: {
          id: 1001,
          name: 'tester'
        }
      },
      'secretOrPrivateKey',
      {
        expiresIn: '10 minutes'
      }
    )
  })

})

let ws_data = [
  {
    id: 1,
    device: '箱变22#',
    longitude: 111.899,
    latitude: 27.184,
    sectionId: 1
  },
  {
    id: 2,
    device: '箱变23#',
    longitude: 111.897,
    latitude: 27.183,
    sectionId: 1
  },
  {
    id: 3,
    device: '箱变94#',
    longitude: 110.479,
    latitude: 27.8011,
    sectionId: 7
  },
  {
    id: 4,
    device: 'HH #1',
    longitude: 112.6339035,
    latitude: 26.8922348,
    sectionId: 2
  },
  {
    device: '自装设备A',
    longitude: 111.899639,
    latitude: 27.184422,
    id: 5,
    sectionId: 7
  },
  {
    device: '自装设备B',
    longitude: '111.899',
    latitude: '27.184',
    id: 6,
    sectionId: 8
  }
]

router.get('/xlsx', (req, res) => {
  let wb = XLSX.utils.book_new()
  let ws_name = 'SheetJS'

  /* make worksheet */

  let ws = XLSX.utils.json_to_sheet(ws_data)

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name)
  // save to file
  let fn = path.join(
    os.tmpdir(),
    'powerinsp-' + parseInt(Math.random() * 899999 + 100000) + '.xlsx'
  )
  XLSX.writeFile(wb, fn)
  // send file to browser
  res.download(fn, err => {
    if (err) {
      console.warn(err)
    } else {
      fs.unlink(fn, err => {
        if (err) console.warn('Error deleting tmp file', fn)
      })
    }
  })
})


router.get('/xlsx2', (req, res) => {
  xutils.exportXlsx(res, ws_data, '测试数据')
})

module.exports = router
