const inquirer = require('inquirer'),
      shell = require('shelljs'),
      extractCurrentProjectInformation = require('./extract-current-project-information')


module.exports = options => {
  options.source = options.source || shell.pwd()
  return extractCurrentProjectInformation(options)
    .then( project => {
      const questions = [
        {
          type: 'input',
          name: 'apiName',
          default: project.name,
          message: 'please specify Api Gateway name'
        },
        {
          type: 'input',
          name: 'functionName',
          default: project.name,
          message : 'please specify the name of the Lambda function'
        },
        {
          type: 'confirm',
          name: 'enableVpc',
          default: false,
          message: 'Do you want to connect to a VPC?'
        },
        {
          type: 'confirm',
          name: 'createNewRole',
          default: true,
          message: 'Do you want to create a new role for the lambda?'
        }
      ]
    })
}

module.exports.commander = {
  '--api-name' : 'Name of the Api Gateway',
  '--function-name' : 'Name of the Lambda function'
}
