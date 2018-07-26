const path = require('path')
const moment = require('moment')
const _ = require('lodash')
const fse = require('fs-extra')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const PLAIN = { plain: true }
const dbFile = path.join(__dirname, '../db.json')

// const sequelize = new Sequelize('powerins', 'postgres', 'postgres', {
//   host: 'localhost',
//   dialect: 'postgres',
//   operatorsAliases: false,

//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// })
const sequelize = require('../db')

const Model = require('../models')
let {
  Workshop,
  Section,
  Device,
  User,
  Inspect,
  Schedule,
  ScheduleItem,
  Disposal
} = Model

let initDb = async (force = true) => {
  try {
    await sequelize.sync({ force: force })
    //await sequelize.getQueryInterface().bulkDelete('workshops')
    let data = await fse.readFile(dbFile)
    data = JSON.parse(data)

    // 添加车间
    await Workshop.bulkCreate(data.workshops)
    //let max = _.maxBy(data.workshops, e=>{return e.id})
    let maxid = await Workshop.max('id')
    await sequelize.query(`select setval('workshops_id_seq', ${maxid})`)

    // 添加区段
    await Section.bulkCreate(data.sections)
    maxid = await Section.max('id')
    await sequelize.query(`select setval('sections_id_seq', ${maxid})`)

    // 添加账号
    await User.bulkCreate(data.users)
    maxid = await User.max('id')
    await sequelize.query(`select setval('users_id_seq', ${maxid})`)

    // 添加设备
    await Device.bulkCreate(data.devices)
    maxid = await Device.max('id')
    await sequelize.query(`select setval('devices_id_seq', ${maxid})`)

    await Schedule.bulkCreate(data.schedules)
    // 添加今日计划项
    data.schedule_items.forEach(e => {
      e.date = moment().format('YYYY-MM-DD')
    })
    await ScheduleItem.bulkCreate(data.schedule_items)
    // 添加昨日计划项
    data.schedule_items.forEach(e => {
      e.date = moment()
        .subtract(1, 'day')
        .format('YYYY-MM-DD')
    })
    await ScheduleItem.bulkCreate(data.schedule_items)
    // 添加月底计划项
    data.schedule_items.forEach(e => {
      e.date = moment()
        .add(1, 'day')
        .format('YYYY-MM-DD')
    })
    await ScheduleItem.bulkCreate(data.schedule_items)
  } catch (err) {
    console.log('===============================================')
    console.error('initDb(): Error occurred:', err)
  }
}

let play1 = async () => {
  let w1 = await Workshop.findOne({
    where: {
      name: '衡阳供电车间'
    },
    include: [User]
  })
  console.log(w1.get(PLAIN))

  let user = await User.findOne({
    where: {
      name: '肖雪峰'
    },
    include: [Workshop]
  })
  console.log(user.get(PLAIN))
}

let play2 = async () => {
  //workshopId=1的设备
  let devices = await Device.findAll({
    include: {
      model: Section,
      where: {
        workshopId: 1
      }
    }
  })
  console.log(
    devices.map(e => {
      return e.get(PLAIN)
    })
  )
}

let play3 = async () => {
  let inspects = await Device.findAll({
    include: {
      model: Section,
      where: {
        workshopId: 1
      }
    }
  })
  console.log(
    devices.map(e => {
      return e.get(PLAIN)
    })
  )
}

let play4 = async () => {
  let r = await Inspect.findOne({
    where: {
      time: {
        [Op.gte]: moment('2018-07-08').toDate(),
        [Op.lte]: moment('2018-07-09')
          .add(1, 'day')
          .toDate()
      }
    }
  })
  if (r) console.log(r.get(PLAIN))
  else console.warn('No result')
}

let play5 = async () => {
  let r = await Disposal.findOne({
    include: [
      {
        model: Workshop,
        where: {
          id: 1
        }
      },
      Inspect
    ],
    where: {
      requestTime: {
        [Op.gte]: moment('2018-07-15').toDate(),
        [Op.lte]: moment('2018-07-16')
          .add(1, 'day')
          .toDate()
      }
    }
  })
  if (r) console.log(r.get(PLAIN))
  else console.warn('No result')
}

let play6 = async () => {
  let r = await Inspect.findAll({
    include: [
      {
        model: Disposal,
        required: false
      }
    ]
  })
  if (r)
    console.log(
      r.map(e => {
        return e.get(PLAIN)
      })
    )
  else console.log('NONE')
}

let play7 = async () => {
  await sequelize.transaction(async t => {
    await Disposal.update(
      {
        status: 'approved'
      },
      {
        transaction: t,
        where: {
          inspectId: 1
        }
      }
    )

    let r = await Disposal.findOne({
      where: {
        inspectId: 1
      },
      transaction: t
    })

    console.log(r.status)

    throw 'Failed'
  })
}

let play8 = async () => {
  let r = await Device.findOne({
    where: {
      images: {
        [Op.not]: null
      }
    }
  })
  console.log(r.images)
}

let play9 = async () => {
  let r = await ScheduleItem.findOne({
    where: {
      id: 8
    },
    include: [
      {
        model: Schedule,
        where: {
          id: 2
        }
      }
    ]
  })
  if (r) console.log(r.get(PLAIN))
  else console.log('NONE')
}

let play10 = async () => {
  let r = await ScheduleItem.update(
    {
      date: '2018-07-27',
      userIds: [1,2],
      sectionId: 5
    },
    {
      where: {
        id: 19
      }
    }
  )
  console.log(r)
}

let run = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
    //await initDb(false)
    await play10()
  } catch (err) {
    console.log('===============================================')
    console.error('run(): Error occurred:', err)
  } finally {
    process.exit(0)
  }
}

let test = async () => {
  await sequelize.authenticate()
  await User.sync({ force: true })

  process.exit(0)
}

run()
//test()
