const inspects = require('./controllers/api/inspects')
const users = require('./controllers/api/users')
const tests = require('./controllers/tests')

function registerRoutes(app) {
  app.use('/api/users', users)
  app.use('/api/inspects', inspects)
  app.use('/tests', tests)
}

module.exports = registerRoutes