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
