const Sequelize = require('sequelize')

module.exports = sequelize => {
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
  Workshop.hasMany(Section)

  const User = sequelize.define('user', {
    name: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    }
  })
  User.belongsTo(Workshop)
  Workshop.hasMany(User)

  const Device = sequelize.define('device', {
    name: { type: Sequelize.STRING },
    latitude: { type: Sequelize.DOUBLE },
    longitude: { type: Sequelize.DOUBLE }
  })
  Device.belongsTo(Section)
  Section.hasMany(Device)

  return {
    Workshop: Workshop,
    Section: Section,
    Device: Device,
    User: User
  }
}
