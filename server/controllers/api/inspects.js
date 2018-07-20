const express = require('express')
const router = express.Router()
const path = require('path')
const _ = require('lodash')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const Model = require('../../models')
let { Workshop, Section, Device, User, Inspect } = Model
const xutils = require('../../xutils')

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
    rec.id = null
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
  let where = {}
  let user = req.user.data
  // qs参数 wid: 车间ID
  if (user.workshopId > 1) {
    where.workshopId = user.workshopId
  } else if (req.query.w) {
    where.workshopId = req.query.w
  }
  // qs参数：设备状态
  let n = req.query.n
  if (n) where.deviceStatus = n
  // qs参数：起止日期（包含）
  let d1 = req.query.d1
  let d2 = req.query.d2
  // qs参数：销号状态
  let ds = _.trim(req.query.ds)
  if (ds && ds != '_all_') where.disposalStatus = ds
  if (d1 && d2) {
    where.time = {
      [Op.gte]: moment(d1).toDate(),
      [Op.lte]: moment(d2)
        .add(1, 'day')
        .toDate()
    }
  }

  // qs参数 _export
  let _export = false
  if (req.query._export) _export = req.query._export == 'true'

  // 取巡检记录
  let inspects = await Inspect.findAll({
    where,
    include: [
      {
        model: User,
        attributes: ['name']
      },
      {
        model: Device,
        attributes: ['name']
      },
      {
        model: Section,
        attributes: ['name']
      },
    ]
  })
  if (_export)
    require('../../xutils').exportXlsx(
      res,
      inspects.map(e => {
        return {
          id: e.id,
          区间: e.section.name,
          设备: e.device.name,
          设备状态: e.deviceStatus,
          缺陷: e.fault,
          巡检人: e.user.name,
          巡检时间: e.time,
          销号状态: xutils.getDisposalStatus(e.disposalStatus)
        }
      }),
      '巡检记录'
    )
  else res.send(inspects)
})

module.exports = router
