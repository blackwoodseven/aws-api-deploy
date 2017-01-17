const inquirer = require('inquirer'),
      shell = require('shelljs'),
      path = require('path')
      extractCurrentProjectInformation = require('./extract-current-project-information'),
      configureSdk = require('../../tasks/configure/aws-sdk'),
      resolveRole = require('./role')

const resolveSource = options => {
  const cwd = shell.pwd(),
        source = options.source != null ? path.resolve(options.source, cwd) : cwd
  return Object.assign({}, options, { source })
}

const configureAws = options => {
  if (options.region) {
    return Promise.resolve(configureSdk(options))
  }
  return inquirer.prompt([require('./aws-region-question')])
    .then( answer => {
      options = Object.assign({}, options, answer)
      return configureSdk(options)
    })
}

const resolveNames = options =>
  extractCurrentProjectInformation(options)
    .then( project => {
      const questions = []
      if (options['api-name'] == null) {
        questions.push({
          type: 'input',
          name: 'api-name',
          default: project.name,
          message: 'please specify Api Gateway name'
        })
      }
      if (options['function-name'] == null) {
        questions.push({
          type: 'input',
          name: 'function-name',
          default: project.name,
          message : 'please specify the name of the lambda function'
        })
      }
      if (questions.length) {
        return inquirer.prompt(questions)
          .then( answers => Object.assign({}, options, answers) )
      }
      return options
    })

module.exports = options => {
  //ensure source is defined and it is an absolute path
  return configureAws(resolveSource(options))
    .then( resolveNames )
    .then( resolveRole )
    .then( answers => {
      console.log(answers)
    })
}

module.exports.commander = {
  '--api-name' : 'Name of the Api Gateway',
  '--function-name' : 'Name of the Lambda function'
}
