const Sequelize = require('sequelize')
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

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')

    // force: true will drop the table if it already exists
    User.sync({ force: true })
      .then(() => {
        // Table created
        return User.create({
          firstName: 'John',
          lastName: 'Hancock'
        })
      })
      .then(() => {
        User.findOne().then(user => {
          console.log(user.get('firstName'))
        })
      })
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })
