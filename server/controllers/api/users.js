const express = require('express')
const router = express.Router()
const { User, Workshop } = require('../../models')

router.get('/', async (req, res) => {
  let users = await User.findAll({
    where: req.query,
    include: Workshop,
    attributes: { exclude: ['password'] }
  })
  res.send(users)
})

router.post('/login', async (req, res) => {
  let user = await User.findOne({
    where: req.body,
    include: Workshop,
    attributes: {exclude: 'password'}
  })
  res.send(user)
})

router.get('/:id', async (req, res) => {
  let user = await User.findById(req.params.id, {
    include: Workshop,
    attributes: {exclude: 'password'}
  })
  res.send(user)
})

module.exports = router
