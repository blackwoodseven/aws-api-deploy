const shell = require('shelljs'),
			path = require('path'),
			readJson = require('../util/read-json')

//which are the required options??

const askMissingParams = ops => {
	const source = ops.source || shell.pwd(),
				packageConfigPath = path.join(source, 'package.json');
	if (! shell.test('-d', source) ) {
		return Promise.reject(
			new Error(
				`${source} is not a folder`
			)
		)
	}
	if (! shell.test('-e', packageConfigPath) ) {
		return Promise.reject(
			new Error(
				`Missing package.json in project folder ${path.resolve(shell.pwd(), source)}`
			)
		)
	}
	return readJson(packageConfigPath)
		.then( packageConfig => {
			if (!packageConfig.dependencies['aws-api-deploy-builder']) {
				return Promise.reject(
					new Error(
						'Missing NPM dependency "aws-api-deploy-builder" in package.json'
					)
				)
			}
			return Object.assign({}, ops, { name: packageConfig.name } )
		})
}

parseArgs(process.args)
  .then( askMissingParams )
  .then( configure )
  .then( saveConfiguration )
  .then( buildPackage )
  .then( getAPIDescription )
  .then( createLambda )
  .then( createApi )
  .then( createPermissions )
