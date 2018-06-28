const _ = require('lodash')

function myP(val, t=500) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (val) resolve(val)
      else reject(val)
    }, t)
  })
}

let firstAsync = async function() {
  try {
    var a = await myP('a', 1000)
    console.log('#1', a)
    var b = await myP('b', 2000)
    console.log('#1', b)
  } catch (ex) {
    console.error('#1 Error occurred:', ex)
  }
}

let multipleAsync = async function() {
  try {
    var a = await myP('c')
    var b = await myP(0)
    var all = await Promise.all([a, b])
    console.log('#2', all)
  } catch (ex) {
    console.error('#2 Error occurred:', ex)
  }
}

let couple = async ()=> {
  await firstAsync()
  await multipleAsync()  
}

let test_lodash_forEach = async ()=>{
  _.forEach(['a','b','c'], async (e,i)=> {
    let r = await myP(e,2000-i*500)
    console.log(`i=${i}, returns ${r}`)
  })
}

let test_js_forEach = async ()=>{
  ['a','b','c'].forEach(async (e,i)=> {
    let r = await myP(e,2000-i*500)
    console.log(`i=${i}, returns ${r}`)
  })
}

test_js_forEach()
