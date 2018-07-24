const express = require('express')
const router = express.Router()
const _ = require('lodash')

const config = require('../../config')
const { User, Workshop } = require('../../models')

router.get('/', async (req, res) => {
  let user = req.user.data
  let where = {}
  // qs参数 w 车间ID
  if (req.query.w) {
    let w = parseInt(req.query.w)
    // 段账号可查看各车间数据；车间账号只能查看本车间数据
    if (user.workshopId == 1 || w == user.workshopId) {
      where.workshopId = w
    } else {
      // 车间账号想查看其他车间的数据？没门
      res.send([])
      return
    }
  } else {
    // 没有指定参数w
    if (user.workshopId > 1) {
      where.workshopId = user.workshopId
    }
  }
  let users = await User.findAll({
    where,
    include: Workshop,
    attributes: { exclude: ['password'] }
  })
  res.send(users)
})

let jwt = require('jsonwebtoken')

router.post('/token', async (req, res) => {
  let account = _.trim(req.body.account)
  let password = _.trim(req.body.password)
  if (!account || !password) {
    res.send({
      ok: false,
      msg: '请提供账号和密码'
    })
    return
  }
  let user = await User.findOne({
    where: {
      account,
      password
    },
    include: [
      {
        model: Workshop,
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      }
    ],
    attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
  })
  if (user) {
    user = user.get({ plain: true })
    res.json({
      ok: true,
      user: user,
      token: jwt.sign(
        {
          name: `u_${user.id}`,
          data: user
        },
        config.tokenSecret,
        {
          expiresIn: config.tokenExpiresIn
        }
      )
    })
  } else {
    res.json({
      ok: false,
      msg: '账号/密码不匹配'
    })
  }
})

router.get('/whoami', (req, res) => {
  let user = req.user.data
  res.send(user)
})

router.get('/:id', async (req, res) => {
  let user = await User.findById(req.params.id, {
    include: Workshop,
    attributes: { exclude: 'password' }
  })
  res.send(user)
})

module.exports = router
