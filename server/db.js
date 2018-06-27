const Sequelize =require('sequelize')

const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost/powerins',
  {
    logging: false
  }
)

module.exports = sequelize