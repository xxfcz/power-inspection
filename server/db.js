const Sequelize =require('sequelize')

const sequelize = new Sequelize('powerins', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
})

module.exports = sequelize
