const express = require('express')
let app = express()
const path = require('path')
const fs = require('fs')
const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const _ = require('lodash')

const xutils = require('./xutils')

//const app = jsonServer.create()
/* static files ----------------------------------------------------- */
app.use(express.static(path.join(__dirname, '../dist')))
app.use('/upload', express.static(path.join(__dirname, './upload')))

const MAX_FILE_SIZE = '5mb'
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit:  MAX_FILE_SIZE}))
// parse application/json
app.use(
  bodyParser.json({
    limit: MAX_FILE_SIZE
  })
)

// req.body 中只含一个 Inspect 对象
const postInspect = (req, res, next) => {
  let rec = req.body
  let savePs = []
  _.forEach(rec.images, img => {
    let imgData = img.data
    delete img.data
    let ext = path.extname(img.name)
    let basename = path.basename(img.name, ext)
    let fileName =
      basename +
      '_' +
      new Date().getTime() +
      '_' +
      parseInt(Math.random() * 1000) +
      ext
    let fileUrl = '/upload/' + fileName
    let savePath = path.join(__dirname, 'upload', fileName)
    savePs.push(
      xutils
        .saveDataImage(savePath, imgData)
        .then(() => {
          console.log('OK saving ' + savePath)
          img.url = fileUrl
        })
        .catch(err => {
          console.error(err)
          throw err
        })
    )
  })

  Promise.all(savePs)
    .then(() => {
      console.info('本记录中的照片全都保存成功！')
      next()
    })
    .catch(r => {
      console.error(r)
      res.send(500, 'Error saving images')
    })
}

app.post('/api/inspects', (req, res, next) => {
  console.log('caught: POST /api/inspects')
  postInspect(req, res, next)
})

/* API handler ----------------------------------------------------- */
const router = jsonServer.router(path.join(__dirname, 'db.json'))
app.use('/api', router)

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
