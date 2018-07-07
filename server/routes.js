const inspects = require('./controllers/api/inspects')
const users = require('./controllers/api/users')
const devices = require('./controllers/api/devices')
const workshops = require('./controllers/api/workshops')
const schedules = require('./controllers/api/shcedules')

const tests = require('./controllers/tests')

function registerRoutes(app) {
  app.use('/api/users', users)
  app.use('/api/inspects', inspects)
  app.use('/api/devices', devices)
  app.use('/api/workshops', workshops)
  app.use('/api/schedules', schedules)

  app.use('/tests', tests)
}

module.exports = registerRoutes
