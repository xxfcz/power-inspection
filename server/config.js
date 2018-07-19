const path = require('path')
let cfg = {}
cfg.rootPath = path.join(__dirname, '.')
cfg.max_body_size = 50*1024*1024
cfg.tokenSecret = 'Lifdleif984*923'
cfg.tokenExpiresIn = '7 days'

module.exports = cfg