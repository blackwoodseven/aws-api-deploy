/*global module, require, Promise */
var tmpPath = require('../../util/tmp-path'),
	readJson = require('../../util/read-json'),
	runNpm = require('../../util/run-npm'),
	shell = require('shelljs'),
	fs = require('fs'),
	path = require('path'),
	localizeDependencies = require('./localize-dependencies'),
	expectedArchiveName = require('../util/expected-archive-name'),
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


module.exports = function collectFiles(sourcePath, useLocalDependencies) {

		const installDependencies = function (targetDir) {
			if (useLocalDependencies) {
				shell.cp('-r', path.join(sourcePath, 'node_modules'), targetDir);
				return Promise.resolve(targetDir);
			} else {
				return runNpm(targetDir, 'install --production');
			}
		},
		rewireRelativeDependencies = function (targetDir) {
			return localizeDependencies(targetDir, sourcePath).then(function () {
				return targetDir;
			});
		}

	return readJson(path.join(sourcePath, 'package.json')).
		then(copyFiles).
		then(rewireRelativeDependencies).
		then(installDependencies);
};
