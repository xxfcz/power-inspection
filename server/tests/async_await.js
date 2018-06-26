function myP(val, t=500) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (val) resolve(val)
      else reject(val)
    }, t)
  })
}

var firstAsync = async function() {
  try {
    var a = await myP('a', 1000)
    console.log('#1', a)
    var b = await myP('b', 2000)
    console.log('#1', b)
  } catch (ex) {
    console.error('#1 Error occurred:', ex)
  }
}

var multipleAsync = async function() {
  try {
    var a = await myP('c')
    var b = await myP(0)
    var all = await Promise.all([a, b])
    console.log('#2', all)
  } catch (ex) {
    console.error('#2 Error occurred:', ex)
  }
}

var couple = async ()=> {
  await firstAsync()
  await multipleAsync()  
}

couple()
