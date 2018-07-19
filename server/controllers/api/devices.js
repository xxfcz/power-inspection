const express = require('express')
const router = express.Router()
const { User, Section, Device } = require('../../models')
const xutils = require('../../xutils')

router.get('/', async (req, res) => {
  let where = {}
  let wid
  let _export = false
  let user = req.user.data
  // 参数 wid: 车间ID
  if (user.workshopId > 1) wid = user.workshopId
  else if (req.query.wid) {
    wid = parseInt(req.query.wid)
  }
  if (wid)
    where = {
      workshopId: wid
    }
  // 参数 _export
  if (req.query._export) _export = req.query._export == 'true'

  // 车间管内设备
  let devices = await Device.findAll({
    include: {
      model: Section,
      where
    }
  })

  if (_export)
    xutils.exportXlsx(
      res,
      devices.map(e => {
        return {
          id: e.id,
          name: e.name,
          section: e.section.name,
          latitude: e.latitude,
          longitude: e.longitude
        }
      }),
      '设备清单'
    )
  else res.send(devices)
})

module.exports = router
