const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const PLAIN = e => {
  return e.get({ plain: true })
}
const moment = require('moment')

const {
  Workshop,
  User,
  Section,
  Device,
  Schedule,
  ScheduleItem,
  Inspect
} = require('../../models')
const xutils = require('../../xutils')

router.get('/', async (req, res) => {
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
  // qs参数 m 月份 (2018.07)
  if (req.query.m) {
    where.month = req.query.m
  }
  // qs参数 t 标题（部分匹配）
  if (req.query.t) {
    where.title = {
      [Op.iLike]: '%' + req.query.t + '%'
    }
  }

  if (req.query.c) {
    where.category = req.query.c
  }

  let schedules = await Schedule.findAll({
    where,
    include: [{
      model: Workshop,
      attributes: ['name']
    }]
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
      attributes: ['id', 'name']
      // include: {
      //   model: Device
      // }
    },
    order: ['date']
  }).map(PLAIN)

  items = await attachUsers(items)
  res.send(items)
})

// 用户uid待完成的下一批任务
router.get('/user/:uid/todo', async (req, res) => {
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
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }
    }
  }).map(PLAIN)

  // 整理成设备清单
  let devices = []
  items.forEach(e => {
    let list = e.section.devices
    delete e.section.devices
    list.forEach(d => {
      d.section = e.section
      devices.push(d)
    })
  })

  // 今天已完成的巡检
  let inspects = await Inspect.findAll({
    where: {
      time: {
        [Op.gte]: moment().toDate(),
        [Op.lte]: moment()
          .add(1, 'day')
          .toDate()
      }
    }
  })
  // 去掉已完成巡检的设备

  //attachUsers(items)
  res.send({
    date,
    devices
  })
})

module.exports = router
