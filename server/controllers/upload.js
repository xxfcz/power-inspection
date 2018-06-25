const express = require('express')
const router = express.Router()

// 文件上传
router.post('/', (req, res) => {
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


module.exports = router