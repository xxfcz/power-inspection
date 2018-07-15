const fs = require('fs')
const XLSX = require('xlsx')
const os = require('os')
const path = require('path')

exports.handleError = function(err, req, res) {
  try {
    let status = err.status || 500
    if (status != 404) {
      let params
      if (req.method == 'GET') params = ' query: ' + JSON.stringify(req.query)
      else if (req.method == 'POST')
        params = ' body: ' + JSON.stringify(req.body)
      //logger.error(req.originalUrl + params, err.stack);
      console.warn('============================================')
      console.warn('Url:', req.originalUrl)
      console.warn('Params:', params)
      console.warn('Stack:', err.stack)
    }
    res.status(status).send({ error: err, url: req.originalUrl })
  } catch (error) {
    console.error('handleError出错：', error)
  }
}

exports.saveDataImage = (filePath, src) => {
  return new Promise((resolve, reject) => {
    let base64_string = src.replace(
      new RegExp('^data:image/.{1,5};base64,'),
      ''
    )
    let binary_data = new Buffer(base64_string, 'base64')
    fs.writeFile(filePath, binary_data, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

exports.exportXlsx = (res, data, sheetName = 'Sheet') => {
  let wb = XLSX.utils.book_new()
  let ws = XLSX.utils.json_to_sheet(data)

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  // save to file
  let fn = path.join(
    os.tmpdir(),
    'powerinsp-' + parseInt(Math.random() * 899999 + 100000) + '.xlsx'
  )
  XLSX.writeFile(wb, fn)
  // send file to browser
  res.download(fn, sheetName + '.xlsx', err => {
    if (err) {
      console.warn(err)
    } else {
      fs.unlink(fn, err => {
        if (err) console.warn('Error deleting tmp file', fn)
      })
    }
  })
}


// 保存照片到文件系统
exports.saveImages = async function (images, subDir = '') {
  let savePs = []
  _.forEach(images, async img => {
    let imgData = img.data
    delete img.data // 重要：从记录中删除图片数据，图片将保存为文件
    let ext = path.extname(img.name)
    let basename = path.basename(img.name, ext)
    let timestamp = new Date().getTime()
    let rand = parseInt(Math.random() * 1000000)
    let fileName = `${basename}_${timestamp}_${rand}${ext}`
    let fileUrl = path.join('/upload', subDir, fileName)
    let savePath = path.join(__dirname, './upload', subDir, fileName)
    savePs.push(
      xutils
        .saveDataImage(savePath, imgData)
        .then(() => {
          console.log('OK saving ' + savePath)
          img.url = fileUrl
        })
        .catch(err => {
          console.error('Error saving ' + savePath)
          console.error(err)
          throw err
        })
    )
  })
  try {
    await Promise.all(savePs)
    console.info('本记录中的照片全都保存成功！')
    return true
  } catch (err) {
    console.error(r)
    return false
  }
}
