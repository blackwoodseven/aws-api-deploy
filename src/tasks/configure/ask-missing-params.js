const inquirer = require('inquirer'),
      getApiDeployments = require('./get-api-deployments'),
      apiGateway = require('../services/api-gateway'),
      _ = require('lodash')

const QUESTIONS = [
  {
		type: 'input',
		name: 'restApiId',
		message: 'API Gateway ID'
	},
	{
		type: 'list',
		choices: ['stage','prod'],
		default: 'stage',
		name: 'stageName',
		message: 'Stage name'
	}
]

const basicQuestions = configuration => {
    const missingQuestions = QUESTIONS.filter( q => ! configuration[q.name] )
    if (missingQuestions.length) {
      return inquirer.prompt(missingQuestions)
        .then( answers => Object.assign(answers, configuration) )
    }
    return Promise.resolve(configuration)
}

const deploymentToChoice = stage => item => {
  var name = `${item.id} ${item.createdDate.format('YYYY-MM-DD HH:mm')} - ${item.description || 'no description'}`
  if (item.id === stage.deploymentId) { name += ' (current)' }
  return {
    value: item.id,
    name
  }
}

const deploymentQuestion = (choices, defaultOption) => [{
  name: 'deploymentId',
  type: 'list',
  message: 'Choose deployment to enable',
  default: defaultOption,
  choices
}]

const askDeploymentId = (configuration, choices, defaultOption) =>
  inquirer.prompt(deploymentQuestion(choices, defaultOption))
    .then( answer => Object.assign(answer, configuration))

const selectDeployment = configuration =>
  Promise.all([
      apiGateway.getStage(_.pick(configuration, 'restApiId', 'stageName')).promise(),
      getApiDeployments(configuration.restApiId)
  ]).then( data => {
    const choices = data[1].map( deploymentToChoice(data[0]) )
    return askDeploymentId(configuration, choices, data[0].deploymentId)
  })


module.exports = configuration =>
  basicQuestions(configuration)
    .then( conf => conf.deploymentId ? conf : selectDeployment(conf) )
