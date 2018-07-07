const express = require('express')
const router = express.Router()
const {User, Group, Section, Device, ScheduleItem} = require('../../models')
const xutils = require('../../xutils')

router.get('/', async (req, res) => {
  let where = {}
  let _export = false
  // 参数 wid: 车间ID
  if (req.query.wid) {
    let wid = parseInt(req.query.wid)
    where = {
      workshopId: wid
    }
  }
  if(req.query.date){
    let date = new Date(req.query.date)
    where.date = date
  }
  console.log(where)

  // 参数 _export
  if (req.query._export) _export = req.query._export == 'true'

  let scheduleItems = await ScheduleItem.findAll({
    where,
    include: [
      {
        model: Group,
        where: {
          id: 1
        },
        attributes: ['id', 'name']
      },
      {
        model: Section,
        attributes: ['id', 'name']
      }
    ]
  })

  if (_export) xutils.exportXlsx(res, scheduleItems, '巡检计划清单')
  else res.send(scheduleItems)
})

module.exports = router
