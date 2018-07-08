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
  },
  role: {
    // sa, 段管理人员, 车间管理人员, 普通职工
    type: Sequelize.ENUM('sa', 'hq', 'ws', 're')
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

const Schedule = sequelize.define('schedule', {
  name: Sequelize.DataTypes.STRING,
  month: Sequelize.DataTypes.STRING,
  type: {
    type: Sequelize.DataTypes.ENUM,
    values: ['monthly', 'temporary']
  }
})
Schedule.belongsTo(Workshop)
Workshop.hasMany(Schedule)

const ScheduleItem = sequelize.define('schedule_item', {
  date: {type: Sequelize.DataTypes.DATEONLY},
  userIds: Sequelize.DataTypes.JSONB, // [1,2,3]
})

ScheduleItem.belongsTo(Schedule)
Schedule.hasMany(ScheduleItem)

ScheduleItem.belongsTo(Section)
Section.hasMany(ScheduleItem)


module.exports = {
  Workshop: Workshop,
  Section: Section,
  Device: Device,
  User: User,
  Inspect: Inspect,
  Schedule: Schedule,
  ScheduleItem: ScheduleItem
}

