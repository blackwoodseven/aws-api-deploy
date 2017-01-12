const configureAWS = require('./aws-sdk'),
      shell = require('shelljs'),
      path = require('path'),
      readJson = require('../../util/read-json'),
      askMissingParams = require('./ask-missing-params'),
      retrieveAWSdata = require('./retrieve-aws-data')

module.exports = options => {
  const source = options.source || shell.pwd(),
        localConfig = path.join(source,'restaws.json');

  return readJson(localConfig)
    .then( conf => Object.assign(conf, options) )
    .then( configureAWS )
    .then( askMissingParams )
    .then( retrieveAWSdata )
}
