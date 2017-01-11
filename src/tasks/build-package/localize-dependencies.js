/*global module, require */
var path = require('path'),
		readJson = require('../../util/read-json'),
		writeJson = require('../../util/write-json')

const isLocalPath = str => typeof str === 'string' && (str[0] === '.' || str.indexOf('file:.') === 0);

const localize = (refdir, props) => {
	if (!props) return;
	Object.keys(props)
		.filter( key => isLocalPath(props[key]) )
		.forEach( key => {
			const oldPath = props[key].replace(/^file:/,''),
						newPath = path.resolve(refdir, oldPath)
			props[key] = `file:${newPath}`
		})
	return props
}

const updateDependencies = (refdir, packageConfig) => {
	[
		'dependencies',
		'devDependencies',
		'optionalDependencies'
	].forEach( depType => localize(refdir, packageConfig[depType]) )

	return packageConfig
}

module.exports = (workdir, referencedir) => {
	const packagePath = path.join(workdir, 'package.json');
	return readJson(packagePath)
		.then( packageConfig => updateDependencies(referencedir, packageConfig) )
		.then( packageConfig => writeJson(packagePath, packageConfig) )
};
