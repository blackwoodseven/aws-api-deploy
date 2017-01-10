const os = require('os'),
			uuid = require('uuid'),
			path = require('path'),
			fs = require('fs');

module.exports = function tmppath(ext) {
	ext = ext || '';
	const result = path.join(os.tmpdir(), uuid.v4() + ext)
	return fs.existsSync(result) ? tmppath(ext) : result
};
