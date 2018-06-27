const express = require('express')
const router = express.Router()

const { User, Workshop } = require('../../models')

router.get('/', async (req, res) => {
  let workshops = await Workshop.findAll()
  res.send(workshops)
})

module.exports = router
