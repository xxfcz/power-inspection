const express = require('express')
const router = express.Router()
const path = require('path')
const formidable = require('formidable')
const _ = require('lodash')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const config = require('../../config')
const Model = require('../../models')
let { Workshop, Section, Device, User, Inspect, Disposal } = Model
const xutils = require('../../xutils')

const MAX_BODY_SIZE = config.max_body_size

router.get('/', async (req, res) => {
  let where = {}
  if (req.query) {
    let w = req.query.w
    if (w) where.workshop = w
    let n = req.query.n
    if (n) where.deviceStatus = n
    let d1 = req.query.d1
    let d2 = req.query.d2
    if (d1 && d2) {
      where.time = {
        [Op.gte]: moment(d1).toDate(),
        [Op.lte]: moment(d2)
          .add(1, 'day')
          .toDate()
      }
    }
  }

  let _export = false
  // 参数 _export
  if (req.query._export) _export = req.query._export == 'true'

  // 取结果记录
  let resultSet = await Disposal.findAll({
    where
  })
  if (_export) require('../xutils').exportXlsx(res, resultSet, '销号记录')
  else res.send(resultSet)
})

router.post('/request/:inspectId/:userId', async (req, res) => {
  var form = new formidable.IncomingForm()
  form.uploadDir = path.join(__dirname, '../../upload')
  form.keepExtensions = true
  form.maxFileSize = MAX_BODY_SIZE
  form.parse(req, async function(err, fields, files) {
    let images = _.map(files, e => {
      // return {
      //   url: e.path.replace(form.uploadDir, '/upload'),
      //   name: e.name,
      //   type: e.type,
      //   size: e.size,
      //   lastModified: e.lastModified
      // }
      return e.path.replace(form.uploadDir, '/upload')
    })

    let obj = {
      status: 'requested',
      inspectId: req.params.inspectId,
      requestUserId: req.params.userId
    }
    let r = await Disposal.findOrCreate({
      where: obj,
      defaults: {
        requestTime: new Date(),
        images: images
      }
    })
    res.send(r[0])
  })
})

router.get('/:id', async (req, res) => {
  let r = await Disposal.findById(req.params.id)
  res.send(r)
})

module.exports = router
