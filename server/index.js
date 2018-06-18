const jsonServer = require('json-server')
const path = require('path')
const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

server.get('/echo', (req, res) => {
  res.send('hello!')
}) 

server.use(middlewares)

// server.use(jsonServer.rewriter({
//   '/api/*': '/$1'
// }))

server.use('/api', router)


server.listen(3002, () => {
  console.log('JSON Server is running on 3002...')
})