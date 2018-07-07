const Sequelize =require('sequelize')

const sequelize = new Sequelize('powerins', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  //logging: true
})

module.exports = sequelize
