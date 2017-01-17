const inquirer = require('inquirer')
const AWS = require('aws-sdk')

const AssumeRolePolicyDocument = JSON.stringify({
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: {
        Service: 'lambda.amazonaws.com'
      },
      Action: 'sts:AssumeRole'
    }
  ]
})

const createRole = iam => options =>
  inquirer.prompt({
    type: 'input',
    name: 'Path',
    message: 'Role path',
    default: '/'
  }).then( params => {
    params.RoleName = getRoleName(options.role);
    params.AssumeRolePolicyDocument = AssumeRolePolicyDocument;
    return iam.createRole(params).promise()
  }).then( data => Object.assign(
    {},
    options,
    { role: data.Role }
  ))

const getRoleName = role => role.startsWith('iam:') ?
  role.split('role').pop('/') : role

const getOrCreate = options => {
  const iam = new AWS.IAM(),
        create = createRole(iam),
        params = {
          RoleName: getRoleName(options['role'])
        };

  return iam.getRole(params).promise()
    .then( data => Object.assign({}, options, { role: data.Role }) )
    .catch( err => {
      if (err.code === 'NoSuchEntity') {
        return inquirer.prompt({
          type: 'confirm',
          name: 'createNewRole',
          message: `Role ${params.RoleName} does not exists, do you want to create it?`,
          default: true
        }).then( answers => {
          if (answers.createNewRole) {
            return create(options)
          } else {
            return Promise.reject(new Error('Specify a correct role'))
          }
        })
      }
      return Promise.reject(err)
    })
}

module.exports = options => {
  if (options['role']) {
    return getOrCreate(options)
  } else {
    return inquirer.prompt({
      type: 'input',
      name: 'role',
      message: 'Specify role name or role arn',
      default: `${options['function-name']}-executor`
    }).then( answers => Object.assign({}, options, answers) )
      .then( getOrCreate )
  }
}
