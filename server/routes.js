const api = require('./controllers/api')
const tests = require('./controllers/tests')

function registerRoutes(app) {
  app.use('/api', api)
  app.use('/tests', tests)
}

module.exports = registerRoutes