const express = require('express')
let app = express()
const path = require('path')
const bodyParser = require('body-parser')
const _ = require('lodash')
const bytes = require('bytes')

const config = require('../config')
const routes = require('./routes')

const MAX_BODY_SIZE =
  process.env.NODE_ENV === 'production'
    ? config.build.max_body_size
    : config.dev.max_body_size

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
    res.status(err.status || 500)
    res.send({
      url: req.originalUrl,
      message: err.message,
      error: err
    })
  })

app.listen(3002, () => {
  console.log(`NODE_ENV=${app.get('env')}`)
  console.log('Express Server is running on 3002...')
})
