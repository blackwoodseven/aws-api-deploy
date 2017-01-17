const shell = require('shelljs'),
			path = require('path'),
			readJson = require('../util/read-json')

module.exports  = options => {
  const packageConfigPath = path.join(options.source, 'package.json');

  if (! shell.test('-d', options.source) ) {
    return Promise.reject(
      new Error(
        `${options.source} is not a folder`
      )
    )
  }
  if (! shell.test('-e', packageConfigPath) ) {
    return Promise.reject(
      new Error(
        `Missing package.json in project folder ${path.resolve(shell.pwd(), options.source)}`
      )
    )
  }
  return readJson(packageConfigPath)
    .then( packageConfig => {
      if (!packageConfig.dependencies['yaarh-lib']) {
        return Promise.reject(
          new Error(
            'Missing NPM dependency "yaarh-lib" in package.json. Please install it before continue'
          )
        )
      }
      return {
        name: packageConfig.name
      }
    })
}
