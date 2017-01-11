const collectFiles = require('./collect-files'),
      zipDir = require('./zipdir')
module.exports = options =>
  collectFiles(options)
    .then( zipDir )
