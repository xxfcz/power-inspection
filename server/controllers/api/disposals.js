const express = require('express')
const router = express.Router()
const path = require('path')
const _ = require('lodash')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const Model = require('../../models')
let { Workshop, Section, Device, User, Inspect, Disposal } = Model
const xutils = require('../../xutils')

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

router.post('/', (req, res) => {
  await Disposal.findOrCreate({
    status: 'requested',
    requestTime: new Date(),
    inspectId: 1
  })
})

module.exports = router
