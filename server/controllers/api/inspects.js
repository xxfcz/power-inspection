const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const sequelize = require('../../db')
const Model = require('../../models')
let { Workshop, Section, Device, User } = Model

const xutils = require('../../xutils')
const dbFile = path.join(__dirname, '../../db.json')

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
    let savePath = path.join(__dirname, '../upload', fileName)
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
      res.status(500).send('Error saving images')
    })
}

router.post('/inspects', (req, res, next) => {
  console.log('caught: POST /api/inspects')
  postInspect(req, res, next)
})

router.get('/inspects', (req, res) => {
  fs.readFile(dbFile, (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send(err.message)
    } else {
      data = JSON.parse(data)

      console.log(req.query)
      let w = req.query.w
      let d1 = req.query.d1
      let d2 = req.query.d2
      let _export = false
      // 参数 _export
      if(req.query._export)
        _export = req.query._export == 'true'

      // 取巡检记录
      let inspects = _.filter(data.inspects, t => {
        let result = true
        if (result && w){
          result = result && (t.workshop == w)
        }
        if(result && d1){
          result = result && (t.createTime.substring(0,10) >= d1)
        }
        if(result && d2){
          result = result && (t.createTime.substring(0,10) <= d2)
        }
        return result
      })
      if(_export)
        require('../xutils').exportXlsx(res, inspects, '巡检记录')
      else
        res.send(inspects)
    }
  })
})

module.exports = router