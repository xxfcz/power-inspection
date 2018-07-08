const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const sequelize = require('../../db')
const Model = require('../../models')
let { Workshop, Section, Device, User, Inspect } = Model

const xutils = require('../../xutils')
const dbFile = path.join(__dirname, '../../db.json')

// 保存照片到文件系统
async function saveImages(images) {
  let savePs = []
  _.forEach(images, async img => {
    let imgData = img.data
    delete img.data // 重要：从记录中删除图片数据，图片将保存为文件
    let ext = path.extname(img.name)
    let basename = path.basename(img.name, ext)
    let timestamp = new Date().getTime()
    let rand = parseInt(Math.random() * 1000000)
    let fileName = `${basename}_${timestamp}_${rand}${ext}`
    let fileUrl = '/upload/' + fileName
    let savePath = path.join(__dirname, '../../upload', fileName)
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

// req.body 中只含一个 Inspect 对象
const postInspect = async (req, res, next) => {
  let rec = req.body
  try {
    let r1 = await saveImages(rec.images)
    if (!r1) {
      res.status(500).end('Error saving images')
      return
    }
    // 保存巡检记录到数据库
    let r2 = await Inspect.create(rec)
    res.send(r2)
  } catch (err) {
    xutils.handleError(err, req, res)
  }
}

router.post('/', (req, res, next) => {
  console.log('caught: POST /api/inspects')
  postInspect(req, res, next)
})

router.get('/', async (req, res) => {
  console.log(req.query)
  let where = {}
  if (req.query) {
    let w = req.query.w
    if (w) where.workshop = w
    let d1 = req.query.d1
    let d2 = req.query.d2
  }

  let _export = false
  // 参数 _export
  if (req.query._export) _export = req.query._export == 'true'

  // 取巡检记录
  let inspects = await Inspect.findAll({
    where
  })
  if (_export) require('../xutils').exportXlsx(res, inspects, '巡检记录')
  else res.send(inspects)
})

module.exports = router
