const tests = require('./controllers/tests')

function registerRoutes(app) {
  app.use('/tests', tests)
}

module.exports = registerRoutes