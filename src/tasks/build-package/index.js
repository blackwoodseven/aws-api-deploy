const preparePackageContent = require('./prepare-package-content'),
      zipDir = require('./zipdir')
module.exports = options =>
  preparePackageContent(options)
    .then( zipDir )
