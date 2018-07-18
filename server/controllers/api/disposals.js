const express = require('express')
const router = express.Router()
const path = require('path')
const formidable = require('formidable')
const _ = require('lodash')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const db = require('../../db')
const config = require('../../config')
const Model = require('../../models')
let { Workshop, Section, Device, User, Inspect, Disposal } = Model
const xutils = require('../../xutils')

const MAX_BODY_SIZE = config.max_body_size

router.get('/', async (req, res) => {
  let w = req.query.w
  let where = {}
  if (req.query) {
    let s = req.query.s
    if (s) where.status = s
    let d1 = req.query.d1
    let d2 = req.query.d2
    if (d1 && d2) {
      where.requestedAt = {
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
    include: [
      {
        model: Workshop,
        where: {
          id: w
        }
      },
      Inspect
    ],
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
    let iid = req.params.inspectId
    let uid = req.params.userId
    let user = await User.findById(uid)
    if (!user) {
      return res.send({
        ok: false,
        msg: `用户ID不存在：${uid}`
      })
    }
    // 检查是否已有销号记录
    let disp = await Disposal.findOne({
      where: {
        inspectId: iid
      }
    })
    if (disp) {
      return res.send({
        ok: false,
        msg: `指定的巡检记录${iid}已有对应的销号记录`
      })
    }
    // 在一个事务中：创建销号记录，并更新巡检记录的销号状态
    db.transaction(async t => {
      let result = {}
      try {
        // 创建销号记录（申请销号）
        await Disposal.create(
          {
            status: 'requested',
            inspectId: iid,
            requestUserId: uid,
            workshopId: user.workshopId,
            requestedAt: new Date(),
            images: images
          },
          { transaction: t }
        )
        // 同步巡检记录的销号状态
        await Inspect.update(
          {
            disposalStatus: 'requested'
          },
          {
            where: {
              id: iid
            },
            transaction: t
          }
        )
        result = {
          ok: true
        }
      } catch (ex) {
        result = {
          ok: false,
          msg: `服务器出错：${ex.message}`
        }
      }
      res.send(result)
    })
  })
})

/**
 * 同意销号（审核通过）
 */
router.post('/:id/:act/by/:uid', async (req, res) => {
  let id = parseInt(req.params.id)
  let uid = parseInt(req.params.uid)
  let act = req.params.act
  if (act != 'approved' && act != 'rejected') {
    res.send({
      ok: false,
      msg: `URL含有非法参数：${act}`
    })
    return
  }
  let r = await Disposal.findById(id)
  if (!r) {
    //res.status(404).send(`未找到指定的销号记录：${id}`)
    res.send({
      ok: false,
      msg: `未找到指定的销号记录：id=${id}`
    })
    return
  }
  if (r.status != 'requested') {
    //res.status(412).send(`指定的销号记录已被处理：${id}`)
    res.send({
      ok: false,
      msg: `指定的销号记录已被处理：id=${id}`
    })
    return
  }

  let result = await Disposal.update(
    {
      status: act,
      repliedAt: new Date(),
      replyUserId: uid
    },
    {
      where: { id }
    }
  )
  //if (result && result.length > 0 && result[0] == 1)
  res.send({
    ok: true,
    msg: `请求的操作已成功执行`
  })
})

router.get('/:id', async (req, res) => {
  let r = await Disposal.findById(req.params.id)
  res.send(r)
})

module.exports = router
