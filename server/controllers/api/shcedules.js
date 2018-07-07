const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const PLAIN = e => {
  return e.get({ plain: true })
}
const moment = require('moment')

const {
  User,
  Section,
  Device,
  Schedule,
  ScheduleItem
} = require('../../models')
const xutils = require('../../xutils')

router.get('/', async (req, res) => {
  let where = {}
  // 参数 wid: 车间ID
  if (req.query.wid) {
    let wid = parseInt(req.query.wid)
    where = {
      workshopId: wid
    }
  }
  // 参数：月份 (2018.07)
  if (req.query.month) {
    where.month = req.query.month
  }

  if (req.query.name) {
    where.name = {
      [Op.iLike]: '%' + req.query.name + '%'
    }
  }

  if (req.query.type) {
    where.type = req.query.type
  }

  let schedules = await Schedule.findAll({
    where
  })
  res.send(schedules)
})

let attachUsers = async items => {
  // 各计划项对应的用户
  for (let x in items) {
    let item = items[x]
    // let sections = await Section.findAll({
    //   where:{
    //     id:{
    //       [Op.in]: item.sectionIds
    //     }
    //   },
    //   attributes: ['id', 'name']
    // })
    // item.sections = sections.map(PLAIN)
    let users = await User.findAll({
      where: {
        id: {
          [Op.in]: item.userIds
        }
      },
      attributes: ['id', 'name']
    })
    item.users = users.map(PLAIN)
  }
  return items
}

router.get('/:id', async (req, res) => {
  let where = {
    scheduleId: req.params.id
  }

  let items = await ScheduleItem.findAll({
    where,
    include: {
      model: Section,
      attributes: ['id', 'name'],
      // include: {
      //   model: Device
      // }
    }
  }).map(PLAIN)

  items = await attachUsers(items)
  res.send(items)
})

// 用户uid待完成的下一批任务
router.get('/user/:uid/todo', async (req, res) => {
  console.log(req.params)
  let uid = parseInt(req.params.uid)
  // 自今天起有任务的最近日期
  let date = await ScheduleItem.min('date', {
    where: {
      date: {
        [Op.gte]: moment().format('YYYY-MM-DD')
      },
      userIds: {
        [Op.contains]: uid
      }
    }
  })
  if (date == null) {
    res.send({
      date,
      devices: []
    })
    return
  }
  // 该日期的计划项
  let items = await ScheduleItem.findAll({
    where: {
      date,
      userIds: {
        [Op.contains]: uid
      }
    },
    include: {
      model: Section,
      attributes: ['id', 'name'],
      include: {
        model: Device,
        attributes: {exclude: ['createdAt', 'updatedAt']}
      }
    }
  }).map(PLAIN)

  // 整理成设备清单
  let devices = []
  items.forEach(e=>{
    let list = e.section.devices
    delete e.section.devices
    list.forEach(d => {
      d.section = e.section
      devices.push(d)
    })
  })

  //attachUsers(items)
  res.send({
    date,
    devices
  })
})

module.exports = router
