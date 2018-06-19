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

app.use(jsonServer.bodyParser)
app.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  // Continue to JSON Server router
  next()
})

app.get('/echo', (req, res) => {
  res.send('hello!')
})

// 文件上传
app.post('/upload', (req, res) => {
  // var filename = req.files.upload.path //文件存放绝对路径
  // var title = req.files.upload.name //上传后解析过的文件名
  res.send('ok')
})

app.listen(3002, () => {
  console.log('Express Server is running on 3002...')
})
