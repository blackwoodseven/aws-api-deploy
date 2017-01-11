const fs = require('fs')

module.exports = (path, content) => new Promise( (resolve, reject) => {
  fs.writeFile(
    path,
    JSON.stringify(content),
    'utf-8',
    err => err ? reject(err) : resolve()
  )
})
