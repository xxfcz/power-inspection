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

const User = sequelize.define('user', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  }
})

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

Section.belongsTo(Workshop)

var initDb = async () => {
  try {
    await Workshop.sync({ force: true })
    await Section.sync({ force: true })

    let names = ['衡阳供电车间', '耒阳供电车间', '郴州供电车间', '西渡供电车间']
    for (let w of names) {
      await Workshop.findOrCreate({
        where: { name: w }
      })
    }

    let w = await Workshop.findOne({
      where: {
        name: '衡阳供电车间'
      }
    })

    for (let s of [
      '衡阳至周家坳自闭',
      '衡阳至周家坳贯通',
      '周家坳至东阳渡自闭',
      '周家坳至东阳渡贯通',
      '东阳渡至向阳桥自闭',
      '东阳渡至向阳桥贯通',
      '哲桥至耒阳自闭',
      '哲桥至耒阳贯通'
    ]) {
      await Section.findOrCreate({
        where: {
          name: s,
          workshopId: w.id
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
  //console.log(w1.get({ plain: true }))

  await Section.update({
    workshopId: 2
  },{
    where: {
      id: { [Op.gte]: 7}
    }
  })
}

var run = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
    await initDb()

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
