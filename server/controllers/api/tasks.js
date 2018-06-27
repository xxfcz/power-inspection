const db = require('../../db')
const [User, Workshop, Sections] = require('../../models')

router.get('/devices', async (req, res) => {
  let uid = null
  let wid = null
  let _export = false
  let workshop = null
  // 参数 uid： 用户ID
  if (req.query.uid) {
    uid = parseInt(req.query.uid)
    let user = await User.findById(uid, { include: Workshop })
    if (!user) {
      let err = `no user for query param: uid=${uid}`
      res.status(500).send(err)
      return
    }
    workshop = user.workshop
    if (!workshop) {
      res.status(500).send(`no workshop for user id ${uid}`)
      return
    }
  }
  // 参数 wid: 车间ID
  if (req.query.wid) {
    wid = parseInt(req.query.wid)
    workshop = await Workshop.findById(wid)
    if (!workshop) {
      res.status(500).send(`no workshop for id ${wid}`)
      return
    }
  }
  // 参数 _export
  if (req.query._export) _export = req.query._export == 'true'

  // 车间管内区段
  let sections = Sections.findAll({ where: { workshopId: wid } })
  // 车间管内设备/任务
  let tasks = _.filter(data.tasks, t => {
    return _.findIndex(sections, { id: t.sectionId }) > -1
  })
  _.forEach(tasks, t => {
    let sec = _.find(sections, { id: t.sectionId })
    if (sec) {
      t.sectionName = sec.name
      t.workshopName = workshop.name
    }
  })
  if (_export) require('../xutils').exportXlsx(res, tasks, '设备清单')
  else res.send(tasks)
})
