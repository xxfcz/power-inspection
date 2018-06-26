const Sequelize = require('sequelize')
const Op = Sequelize.Op

const sequelize = new Sequelize('powerins', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

const Workshop = sequelize.define('workshop', {
  name: {
    type: Sequelize.STRING
  }
})

const Section = sequelize.define('section', {
  name: {
    type: Sequelize.STRING
  }
})

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING
  }
})

Section.belongsTo(Workshop)
User.belongsTo(Workshop)

var initDb = async () => {
  try {
    await sequelize.sync({ force: true })

    //await sequelize.getQueryInterface().bulkDelete('workshops')
    // 添加车间
    await Workshop.bulkCreate(
      ['衡阳供电车间', '耒阳供电车间', '郴州供电车间', '西渡供电车间'].map(
        e => {
          return { name: e }
        }
      )
    )

    // 添加区段
    await Section.bulkCreate(
      [
        ['衡阳至周家坳自闭', 1],
        ['衡阳至周家坳贯通', 1],
        ['周家坳至东阳渡自闭', 1],
        ['周家坳至东阳渡贯通', 1],
        ['东阳渡至向阳桥自闭', 1],
        ['东阳渡至向阳桥贯通', 1],
        ['哲桥至耒阳自闭', 2],
        ['哲桥至耒阳贯通', 2]
      ].map(e => {
        return {
          name: e[0],
          workshopId: e[1]
        }
      })
    )

    // 添加账号
    let users = [['肖雪峰', 4], ['张三', 1], ['李四', 2]]
    for (let u of users) {
      await User.findOrCreate({
        where: {
          name: u[0],
          workshopId: u[1]
        }
      })
    }
  } catch (err) {
    console.log('===============================================')
    console.error('initDb(): Error occurred:', err)
  }
}

var play = async () => {
  let w1 = await Workshop.findOne({
    where: {
      name: '衡阳供电车间'
    }
  })
  let users = await w1.getUsers()
  console.log(users.get({ plain: true }))
}

var run = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
    //await initDb()

    await play()
  } catch (err) {
    console.log('===============================================')
    console.error('play(): Error occurred:', err)
  } finally {
    process.exit(0)
  }
}

const Project = sequelize.define('project', {
  name: Sequelize.STRING
})

Project.hasOne(User)

var test = async () => {
  await sequelize.authenticate()
  await User.sync({ force: true })
  await Project.sync({ force: true })
  process.exit(0)
}

run()
//test()
