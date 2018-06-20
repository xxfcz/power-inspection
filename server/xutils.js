const fs = require('fs')

exports.saveDataImage = (filePath, src) =>{
  return new Promise((resolve, reject)=>{
    let base64_string = src.replace(new RegExp('^data:image/.{1,5};base64,'), '')
    let binary_data = new Buffer(base64_string, 'base64')
    fs.writeFile(filePath, binary_data, err => {
      if(err)
        reject(err)
      else
        resolve()
    })
  })

}