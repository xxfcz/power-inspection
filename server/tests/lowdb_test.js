const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ posts: [] })
  .write()

const result = db.get('posts')
  .push({ name: process.argv[2] })
  .write()

console.log(result)