const express = require('express')
let app = express()
const path = require('path')
const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const _ = require('lodash')

//const app = jsonServer.create()
app.use(express.static(path.join(__dirname, '../dist')))
app.use('/upload', express.static(path.join(__dirname, './upload')))

// app.post('/api/inspects', (req, res)=>{
//   res.send('caught: POST /api/inspects');
// })

const router = jsonServer.router(path.join(__dirname, 'db.json'))
app.use('/api', router)


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.get('/echo', (req, res) => {
  res.send('hello!')
})

// 文件上传
app.post('/upload', (req, res) => {
  var form = new formidable.IncomingForm()
  form.uploadDir = path.join(__dirname, './upload')
  form.keepExtensions = true
  form.maxFileSize = 5 * 1024 * 1024

  form.parse(req, function(err, fields, files) {
    res.send(
      _.map(files, e => {
        return {
          path: e.path.replace(form.uploadDir, '/upload'),
          name: e.name,
          type: e.type,
          size: e.size
        }
      })
    )
  })
  // var filename = req.files.upload.path //文件存放绝对路径
  // var title = req.files.upload.name //上传后解析过的文件名
  //res.send('ok')
})

app.listen(3002, () => {
  console.log('Express Server is running on 3002...')
})
