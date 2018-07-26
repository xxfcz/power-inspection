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
    include: [
      {
        model: Workshop,
        attributes: ['name']
      }
    ]
  })
  res.send(schedules)
})

let attachUsers = async items => {
  // 各计划项对应的用户
  for (let i = 0; i < items.length; ++i) {
    try {
      let item = items[i]
      let userIds = item.userIds
      if (typeof userIds == 'string') {
        userIds = JSON.parse(userIds)
      }
      let users = await User.findAll({
        where: {
          id: {
            [Op.in]: userIds
          }
        },
        attributes: ['id', 'name']
      })
      item.users = users
    } catch (ex) {
      continue
    }
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
  })
  if (items) items = items.map(PLAIN)
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
  })
  if (items) items = items.map(PLAIN)

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

router.delete('/:sid/items/:iid', async (req, res) => {
  let iid = parseInt(req.params.iid)
  let sid = parseInt(req.params.sid)
  let user = req.user.data
  let schedule = await Schedule.findById(sid)
  if (!schedule) {
    return res.send({
      ok: fasle,
      msg: `指定的计划不存在：id=${sid}`
    })
  }
  if (user.workshopId > 1 && user.workshopId != schedule.workshopId) {
    res.send({
      ok: false,
      msg: '不能删除别人车间的计划项'
    })
    return
  }

  let r = await ScheduleItem.destroy({
    where: {
      id: iid,
      scheduleId: sid
    }
  })
  if (r > 0) {
    res.send({
      ok: true
    })
  } else {
    res.send({
      ok: false,
      msg: `未能删除指定的计划详情：sid=${sid}&iid=${iid}。不存在？`
    })
  }
})

/**
 * 添加计划细项
 */
router.post('/:sid/items/', async function addItem(req, res) {
  let sid = parseInt(req.params.sid)
  let user = req.user.data
  let schedule = await Schedule.findById(sid)
  if (!schedule) {
    return res.send({
      ok: fasle,
      msg: `指定的计划不存在：id=${sid}`
    })
  }
  if (user.workshopId > 1 && user.workshopId != schedule.workshopId) {
    res.send({
      ok: false,
      msg: '不能操作别人车间的计划'
    })
    return
  }

  let data = req.body
  let r = await ScheduleItem.create({
    date: data.date,
    userIds: data.userIds,
    sectionId: data.sectionId,
    scheduleId: sid
  })
  if (r && r.id > 0) {
    res.send({
      ok: true
    })
  } else {
    res.send({
      ok: false,
      msg: `未能创建指定的计划细项`
    })
  }
})

/**
 * 更新计划细项
 */
router.put('/:sid/items/:iid', async (req, res) => {
  let sid = parseInt(req.params.sid)
  let iid = parseInt(req.params.iid)
  let user = req.user.data
  let sch = await Schedule.findById(sid)
  if (sch == null) {
    res.send({
      ok: false,
      msg: `指定的计划不存在：sid=${sid}`
    })
    return
  }
  if (user.workshopId > 1 && user.workshopId != sch.workshopId) {
    res.send({
      ok: false,
      msg: '不能操作别人车间的计划'
    })
    return
  }

  let schItem = await ScheduleItem.findById(iid)
  if (!schItem || schItem.scheduleId != sid) {
    return res.send({
      ok: false,
      msg: `指定的计划不包含指定的细项：sid=${sid}, iid=${iid}`
    })
  }

  let data = req.body
  if (typeof data.userIds == 'string') data.userIds = JSON.parse(data.userIds)
  if(!data.userIds instanceof Array || data.userIds.length<2){
    res.send({
      ok: false,
      msg: 'userIds 必须是两个元素的数组'
    })
    return
  }
  let r = await ScheduleItem.update(
    {
      date: data.date,
      userIds: data.userIds,
      sectionId: data.sectionId
    },
    {
      where: {
        id: iid
      }
    }
  )
  if (r && r.length > 0 && r[0] == 1) {
    res.send({
      ok: true
    })
  } else {
    res.send({
      ok: false,
      msg: `未能更新指定的计划细项`
    })
  }
})

module.exports = router
