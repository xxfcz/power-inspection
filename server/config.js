const path = require('path')
let cfg = {}
cfg.rootPath = path.join(__dirname, '.')
cfg.max_body_size = 50*1024*1024
module.exports = cfg