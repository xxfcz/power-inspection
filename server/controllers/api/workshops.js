const express = require('express')
const router = express.Router()

const { User, Workshop } = require('../../models')

router.get('/', async (req, res) => {
  let user = req.user.data
  // 非段级账号，只能看到本车间
  let where = {}
  if (user.workshopId > 1) {
    where.id = user.workshopId
  }
  let workshops = await Workshop.findAll({ where })
  res.send(
    workshops.filter(w => {
      return w.id > 1
    })
  )
})

module.exports = router
