const express = require('express')
let app = express()
const path = require('path')
const fs = require('fs')
const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const _ = require('lodash')
const bytes = require('bytes')

const xutils = require('./xutils')
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

app.get('/api/tasks', (req, res) => {
  fs.readFile('db.json', (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send(err.message)
    } else {
      let uid = null
      let wid = null
      let _export = false
      let workshop = null
      // 参数 uid： 用户ID
      if (req.query.uid) {
        uid = parseInt(req.query.uid)
        let user = _.find(data.users, { id: uid })
        if (!user) {
          let err = `no user for query param: uid=${uid}`
          res.status(500).send(err)
          return
        }
        wid = user.workshopId
      }
      // 参数 wid: 车间ID
      if (req.query.wid){
        wid = parseInt(req.query.wid)
      }
      // 参数 _export
      if(req.query._export)
        _export = req.query._export == 'true'

      data = JSON.parse(data)
      // 取车间
      workshop = _.find(data.workshops, { id: wid })
      if (!workshop) {
        res.status(500).send(`no workshop for wid=${wid}`)
        return
      }
      // 车间管内区段
      let sections = _.filter(data.sections, { workshopId: wid })
      // 车间管内设备/任务
      let tasks = _.filter(data.tasks, t => {
        return _.findIndex(sections, { id: t.sectionId }) > -1
      })
      _.forEach(tasks, t => {
        let sec = _.find(sections, { id: t.sectionId })
        if (sec) {
          t.sectionName = sec.name
          t.workshopName = workshop.name
        }
      })
      if(_export)
        require('./export_tasks')(req, res, tasks)
      else
        res.send(tasks)
    }
  })
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
