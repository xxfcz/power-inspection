//const express = require('express')
//let app = express()
const path = require('path')
const jsonServer = require('json-server')
const app = jsonServer.create()

const router = jsonServer.router(path.join(__dirname, 'db.json'))
app.use('/api', router)

//app.use(express.static(path.join(__dirname, '../dist')))

const middlewares = jsonServer.defaults({
  static: path.join(__dirname, '../dist')
})
app.use(middlewares)

app.get('/echo', (req, res) => {
  res.send('hello!')
}) 

app.listen(3002, () => {
  console.log('Express Server is running on 3002...')
})