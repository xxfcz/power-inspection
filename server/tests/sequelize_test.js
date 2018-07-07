const path = require('path')
const _ = require('lodash')
const fse = require('fs-extra')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const PLAIN = {plain: true}
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
let {Workshop, Section, Device, User, Group, GroupUser, Inspect, ScheduleItem} = Model

let initDb = async () => {
  try {
    await sequelize.sync({force: true})
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

    // 添加用户分组
    await Group.bulkCreate(data.groups)
    maxid = await Group.max('id')
    await sequelize.query(`select setval('groups_id_seq', ${maxid})`)

    // 用户分配到组
    await GroupUser.bulkCreate(data.group_users)

    // 添加计划
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

let play = async () => {
  let list = await ScheduleItem.findAll({
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
  console.log(list.map(e => {
    return e.get(PLAIN)
  }))
}

let run = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
    //await initDb({sync: true})

    await play()
  } catch (err) {
    console.log('===============================================')
    console.error('run(): Error occurred:', err)
  } finally {
    process.exit(0)
  }
}

let test = async () => {
  await sequelize.authenticate()
  await User.sync({force: true})

  process.exit(0)
}

run()
//test()
