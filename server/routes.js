const inspects = require('./controllers/api/inspects')
const users = require('./controllers/api/users')
const devices = require('./controllers/api/devices')
const workshops = require('./controllers/api/workshops')
const schedules = require('./controllers/api/shcedules')
const disposals = require('./controllers/api/disposals')
const tests = require('./controllers/tests')
const upload = require('./controllers/upload')

function registerRoutes(app) {
  app.use('/api/users', users)
  app.use('/api/inspects', inspects)
  app.use('/api/devices', devices)
  app.use('/api/workshops', workshops)
  app.use('/api/schedules', schedules)
  app.use('/api/disposals', disposals)

  app.use('/upload', upload)
  app.use('/tests', tests)
}

module.exports = registerRoutes
