/*global module, require, Promise */
var tmpPath = require('../../util/tmp-path'),
	readJson = require('../../util/read-json'),
	runNpm = require('../../util/run-npm'),
	shell = require('shelljs'),
	fs = require('fs'),
	path = require('path'),
	localizeDependencies = require('./localize-dependencies'),
	expectedArchiveName = require('./expected-archive-name'),
	gunzip = require('gunzip-maybe'),
	tarStream = require('tar-fs');

const extractTarGz = (archive, dir) => new Promise( (resolve, reject) => {
	const extractStream = tarStream.extract(dir)
	extractStream.on('finish', resolve)
	extractStream.on('error', reject)
	fs.createReadStream(archive)
		.pipe(gunzip())
		.pipe(extractStream)
})

const copyFiles = (sourcePath, packageConfig) => {
	const packDir = tmpPath(),
				targetDir = tmpPath(),
				expectedName = expectedArchiveName(packageConfig),
				tarPackage = path.join(packDir, expectedName)
	shell.mkdir('-p', packDir)
	return runNpm(packDir, `pack "${path.resolve(sourcePath)}"`)
		.then( () => extractTarGz(tarPackage, packDir) )
		.then(() => {
			shell.mv(path.join(packDir, 'package'), targetDir)
			shell.rm('-rf', packDir)
			return targetDir
		})
}

const installDependencies = (source, target, options) => {
	if (options['local-dependencies']) {
		shell.cp('-r', path.join(source, 'node_modules'), target)
		return Promise.resolve(target)
	} else if (options['no-optional-dependencies']) {
		return runNpm(target, 'install --production --no-optional')
						.then(() => target)
	} else {
		return runNpm(target, 'install --production')
						.then(() => target)
	}
}

const rewireRelativeDependencies = (source, target) => {
	return localizeDependencies(target, source)
		.then(() => target)
}

const moveNpmrc = (source, target) => {
	const npmrcPath = path.join(source, '.npmrc');
	if (shell.test('-e', npmrcPath)) {
		shell.cp(npmrcPath, target);
	}
	return target;
}

module.exports = (options) => {
	const source = options.source || shell.pwd()
	return readJson(path.join(source, 'package.json'))
		.then( manifest => copyFiles(source, manifest) )
		.then( target => rewireRelativeDependencies(source, target, options) )
		.then( target => moveNpmrc(source, target, options) )
		.then( target => installDependencies(source, target, options) )
};
