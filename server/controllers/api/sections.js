const express = require('express')
const router = express.Router()
const { User, Section, Device } = require('../../models')
const xutils = require('../../xutils')

router.get('/', async (req, res) => {
  let _export = false
  let where = {}
  let user = req.user.data
  // qs参数 w 车间ID
  if (req.query.w) {
    let w = parseInt(req.query.w)
    // 段账号可查看各车间数据；车间账号只能查看本车间数据
    if (user.workshopId == 1 || w == user.workshopId) {
      where.workshopId = w
    } else {
      // 车间账号想查看其他车间的数据？没门
      res.send([])
      return
    }
  } else {
    // 没有指定参数w
    if (user.workshopId > 1) {
      where.workshopId = user.workshopId
    }
  }
  // qs参数 _export
  if (req.query._export) _export = req.query._export == 'true'

  // 车间管内区间
  let sections = await Section.findAll({
    where,
    attributes: ['id', 'name']
  })

  res.send(sections)
})

module.exports = router
