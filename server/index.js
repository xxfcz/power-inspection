const express = require('express')
let app = express()
const path = require('path')
const bodyParser = require('body-parser')
const _ = require('lodash')
const bytes = require('bytes')
const Sequelize = require('sequelize')
const expressJWT = require('express-jwt')

const config = require('./config')
const routes = require('./routes')
const sequelize = require('./db')

const MAX_BODY_SIZE = config.max_body_size

//const app = jsonServer.create()
/* static files ----------------------------------------------------- */
app.use(express.static(path.join(__dirname, '../dist')))
app.use('/upload', express.static(path.join(__dirname, './upload')))

console.info('MAX_BODY_SIZE:', bytes(MAX_BODY_SIZE))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: MAX_BODY_SIZE }))
// parse application/json
app.use(
  bodyParser.json({
    limit: MAX_BODY_SIZE
  })
)

app.use(
  expressJWT({
    secret: config.tokenSecret,
    getToken: function fromHeaderOrQuerystring(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
      ) {
        return req.headers.authorization.split(' ')[1]
      } else if (req.query && req.query._token) {
        return req.query._token
      } else if (req.body && req.body._token) {
        return req.body._token
      }
      return null
    }
  }).unless({
    path: ['/api/users/token'] //除了这些地址，其他的URL都需要验证
  })
)

routes(app)

////////////////////////////////////////////////////////////////////////
//
//   Error Handlers
//

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      //  这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
      res.status(401).send('Invalid token')
      next()
      return
    }
    res.status(err.status || 500)
    res.send({
      url: req.originalUrl,
      message: err.message,
      error: err
    })
  })
}
// production error handler
// no stacktraces leaked to user
else
  app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      //  这个需要根据自己的业务逻辑来处理（ 具体的err值 请看下面）
      res.status(401).send('Invalid token')
      next()
      return
    }
    res.status(err.status || 500)
    res.send({
      url: req.originalUrl,
      message: err.message,
      error: err
    })
  })

sequelize
  .authenticate()
  .then(() => {
    app.listen(3002, () => {
      console.log(`NODE_ENV=${app.get('env')}`)
      console.log('Express Server is running on 3002...')
    })
  })
  .catch(err => {
    console.error('Database error:', err)
  })
