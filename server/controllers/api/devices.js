const express = require('express')
const router = express.Router()
const { User, Section, Device } = require('../../models')
const xutils = require('../../xutils')

router.get('/', async function queryDevices(req, res) {
  let _export = false
  let user = req.user.data
  let where = {}
  // qs参数 wid: 车间ID
  if (user.workshopId > 1) {
    where.workshopId = user.workshopId
  } else if (req.query.wid) {
    where.workshopId = parseInt(req.query.wid)
  }
  // qs参数 _export
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
          名称: e.name,
          区间: e.section.name,
          坐标: e.latitude + ',' + e.longitude
        }
      }),
      '设备清单'
    )
  else res.send(devices)
})

router.put('/:id', function updateDevice(req, res) {
  Device.update(req.body, {
    where: {
      id: req.params.id
    }
  })
    .then(r => {
      if (r[0] == 1) {
        res.send({
          ok: true
        })
      } else {
        res.send({
          ok: false,
          msg: '更新失败！'
        })
      }
    })
    .catch(ex => {
      res.send({
        ok: false,
        msg: ex.message || ex
      })
    })
})

module.exports = router
