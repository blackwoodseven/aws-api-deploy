/*global module, require, Promise */
var shell = require('shelljs'),
	tmppath = require('../../util/tmp-path'),
	archiver = require('archiver'),
	fs = require('fs');
module.exports = (source) => {
	return new Promise(function (resolve, reject) {
		const target = tmppath('.zip'),
					archive = archiver.create('zip', {}),
					zipStream = fs.createWriteStream(target);
		zipStream.on('close', function () {
			shell.rm('-rf', source);
			resolve(target);
		});
		archive.pipe(zipStream);
		archive.bulk([{
			expand: true,
			src: ['**/*'],
			dot: true,
			cwd: source
		}]);
		archive.on('error', function (e) {
			reject(e);
		});
		archive.finalize();
	});
};
