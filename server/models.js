const Sequelize = require('sequelize')
const sequelize = require('./db')

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
  name: {type: Sequelize.STRING},
  latitude: {type: Sequelize.DOUBLE},
  longitude: {type: Sequelize.DOUBLE}
})
Device.belongsTo(Section)
Section.hasMany(Device)

const Inspect = sequelize.define('inspect', {
  workshop: {type: Sequelize.STRING},
  section: {type: Sequelize.STRING},
  device: {type: Sequelize.STRING},
  user: {type: Sequelize.STRING},
  deviceStatus: {type: Sequelize.STRING},
  fault: {type: Sequelize.STRING},
  images: {type: Sequelize.JSON},
  latitude: {type: Sequelize.DOUBLE},
  longitude: {type: Sequelize.DOUBLE},
})

const Group = sequelize.define('group',{
  name: {type: Sequelize.STRING}
})

const GroupUser = sequelize.define('group_user')

User.belongsToMany(Group, {through: GroupUser})
Group.belongsToMany(User, {through: GroupUser})

const ScheduleItem = sequelize.define('schedule_item', {
  date: {type: Sequelize.DATE}
})

ScheduleItem.belongsTo(Workshop)
Workshop.hasMany(ScheduleItem)
ScheduleItem.belongsTo(Group)
Group.hasMany(ScheduleItem)
ScheduleItem.belongsTo(Section)
Section.hasMany(ScheduleItem)

module.exports = {
  Workshop: Workshop,
  Section: Section,
  Device: Device,
  User: User,
  Group: Group,
  GroupUser: GroupUser,
  Inspect: Inspect,
  ScheduleItem: ScheduleItem
}

