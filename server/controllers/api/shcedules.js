const _ = require('lodash')
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
const db = require('../../db')
const xutils = require('../../xutils')

router.get('/', async function getSchedules(req, res) {
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

/**
 * 创建新计划
 */
router.post('/', async function postSchedule(req, res) {
  let defMonth
  if (moment().date() < 10) defMonth = moment().format('YYYY-MM')
  else
    defMonth = moment()
      .add(1, 'months')
      .format('YYYY-MM')

  let data = {
    workshopId: null,
    month: defMonth,
    category: 'monthly',
    title: ''
  }
  let user = req.user.data
  // 参数 w 车间ID
  if (req.body.workshopId) {
    let w = parseInt(req.body.workshopId)
    // 段账号可操作各车间数据；车间账号只能操作本车间数据
    if (user.workshopId == 1 || w == user.workshopId) {
      data.workshopId = w
    } else {
      // 车间账号想操作其他车间的数据？没门
      res.send({
        ok: false,
        msg: '不允许操作其它车间的数据'
      })
      return
    }
  } else {
    // 没有指定参数 workshopId，则采用当前用户的所属车间
    if (user.workshopId > 1) {
      data.workshopId = user.workshopId
    } else {
      // 段级用户，创建段级计划？无意义
      res.send({
        ok: false,
        msg: '新建计划所属车间不明确'
      })
    }
  }
  // 参数 month 月份 (格式 2018-07)；若无指定，则取下一月
  let r = (req.body.month || '').match(/\d{4}\-\d{2}/)
  if (r) {
    data.month = r[0]
  }
  // 参数 title 标题
  if (req.body.title) {
    data.title = req.body.title
  }

  if (req.body.category in ['monthly', 'temporary']) {
    data.category = req.body.category
  }

  try {
    r = await Schedule.create(data)
    if (r) {
      res.send({
        ok: true
      })
    } else {
      res.send({
        ok: false,
        msg: '创建新计划失败'
      })
    }
  } catch (ex) {
    res.send({
      ok: false,
      msg: ex.message
    })
  }
})

/**
 * 复制新计划
 */
router.post('/:id/clone', async function cloneSchedule(req, res) {
  let defMonth
  if (moment().date() < 10) defMonth = moment().format('YYYY-MM')
  else
    defMonth = moment()
      .add(1, 'months')
      .format('YYYY-MM')

  let data = {
    workshopId: null,
    month: defMonth,
    category: 'monthly',
    title: ''
  }
  let user = req.user.data
  // 参数 w 车间ID
  if (req.body.workshopId) {
    let w = parseInt(req.body.workshopId)
    // 段账号可操作各车间数据；车间账号只能操作本车间数据
    if (user.workshopId == 1 || w == user.workshopId) {
      data.workshopId = w
    } else {
      // 车间账号想操作其他车间的数据？没门
      res.send({
        ok: false,
        msg: '不允许操作其它车间的数据'
      })
      return
    }
  } else {
    // 没有指定参数 workshopId，则采用当前用户的所属车间
    if (user.workshopId > 1) {
      data.workshopId = user.workshopId
    } else {
      // 段级用户，创建段级计划？无意义
      res.send({
        ok: false,
        msg: '新建计划所属车间不明确'
      })
    }
  }
  // 参数 month 月份 (格式 2018-07)；若无指定，则取下一月
  let r = (req.body.month || '').match(/(\d{4})\-(\d{2})/)
  let m
  if (r) {
    data.month = r[0]
    m = parseInt(r[2])
  }
  // 参数 title 标题
  if (req.body.title) {
    data.title = req.body.title
  }

  if (req.body.category in ['monthly', 'temporary']) {
    data.category = req.body.category
  }

  let id = req.params.id
  db.transaction(async t => {
    r = await Schedule.create(data, { transaction: t })
    if (!r) {
      return res.send({
        ok: false,
        msg: '复制计划失败'
      })
    }

    let protoItems = (await ScheduleItem.findAll({
      where: {
        scheduleId: id
      },
      attributes: ['date', 'sectionId', 'userIds']
    })).map(PLAIN)
    _.forEach(protoItems, p => {
      p.scheduleId = r.id
      let dt = moment(p.date)
      dt.month(m-1)
      p.date = dt.format('YYYY-MM-DD')
      delete p.id
    })
    r = await ScheduleItem.bulkCreate(protoItems, { transaction: t })
    res.send({
      ok: true,
      msg: r
    })
    // if (r) {
    // } else {
    //   res.send({
    //     ok: false,
    //     msg: '创建新计划失败'
    //   })
    // }
  }).catch(ex => {
    res.send({
      ok: false,
      msg: ex.message
    })
  })
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

router.get('/:id', async function getScheduleById(req, res) {
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
router.get('/user/:uid/todo', async function todo(req, res) {
  let uid = parseInt(req.params.uid)
  // 自今天起有任务的最近日期
  let taskDate = await ScheduleItem.min('date', {
    where: {
      date: {
        [Op.gte]: moment().format('YYYY-MM-DD')
      },
      userIds: {
        [Op.contains]: uid
      }
    }
  })
  if (taskDate == null) {
    res.send({
      taskDate,
      devices: []
    })
    return
  }
  // 该日期的计划项
  let items = await ScheduleItem.findAll({
    where: {
      date: taskDate,
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

  // 如果任务日期是今天，则找出今天完成的巡检记录，并标记对应任务为已完成
  if(taskDate == moment().format('YYYY-MM-DD')){
    let inspects = await Inspect.findAll({
      where: {
        time: {
          [Op.gte]: moment().format('YYYY-MM-DD'),
          [Op.lte]: moment()
            .add(1, 'day')
            .format('YYYY-MM-DD')
        }
      }
    })
    // 已完成巡检的设备(任务），打上 finished 标记
    devices.forEach(d => {
      d.finished = !!inspects.find(i => {
        return i.deviceId == d.id
      })
    })  
  }
  res.send({
    taskDate,
    devices
  })
})

router.delete('/:id', async function deleteSchedule(req, res) {
  let id = parseInt(req.params.id)
  let user = req.user.data
  let schedule = await Schedule.findById(id)
  if (!schedule) {
    return res.send({
      ok: fasle,
      msg: `指定的计划不存在：id=${id}`
    })
  }
  if (user.workshopId > 1 && user.workshopId != schedule.workshopId) {
    res.send({
      ok: false,
      msg: '不能删除别人车间的计划'
    })
    return
  }

  let r = await Schedule.destroy({
    where: {
      id: id
    }
  })
  if (r > 0) {
    res.send({
      ok: true
    })
  } else {
    res.send({
      ok: false,
      msg: `未能删除指定的计划：id=${id}。不存在？`
    })
  }
})

router.delete('/:sid/items/:iid', async function deleteScheduleItem(req, res) {
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
router.post('/:sid/items/', async function postScheduleItem(req, res) {
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
router.put('/:sid/items/:iid', async function putScheduleItem(req, res) {
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
  if (!data.userIds instanceof Array || data.userIds.length < 2) {
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
