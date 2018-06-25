const express = require('express')
const router = express.Router()
const XLSX = require('xlsx')
const fs = require('fs')
const os = require('os')
const path =require('path')

router.get('/hello', (req, res) => {
  res.send('Hello, World!')
})

router.get('/xlsx', (req, res) => {
  let wb = XLSX.utils.book_new()
  let ws_name = 'SheetJS'

  /* make worksheet */
  let ws_data = [['S', 'h', 'e', 'e', 't', 'J', 'S'], [1, 2, 3, 4, 5]]
  let ws = XLSX.utils.aoa_to_sheet(ws_data)

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name)
  // save to file
  let fn = path.join(os.tmpdir(), 'powerinsp-' + parseInt(Math.random()*89999+10000) + '.xlsx')
  XLSX.writeFile(wb, fn)
  // send file to browser
  res.download(fn, err=>{
    if(err){
      console.warn(err)
    }
    else{
      fs.unlink(fn)
    }
  })
})

module.exports = router
