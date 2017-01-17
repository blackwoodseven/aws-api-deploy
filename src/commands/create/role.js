const inquirer = require('inquirer')
const AWS = require('aws-sdk')
const roles = {
              type: 'confirm',
              name: 'createNewRole',
              default: true,
              message: 'Do you want to create a new role for the lambda?'
            }

const createRole = iam => options => {
  
}

const getRoleName = role => role.startsWith('iam:') ?
  role.split('role').pop('/') : role

module.exports = options => {
  const iam = new AWS.IAM()

  if (options['role']) {
    const params = { RoleName: getRoleName(options['role']) }
    return iam.getRole().promise()
      .then( data => Object.assign({}, options, { role: data.Role }))
      .catch( err => {
        if (err.code === 'NoSuchEntity') {
          return inquirer.prompt([
            {
              type: 'input',
              message: 'Name of '
            }
          ])
        }
        return Promise.reject(err)
      })
  } else {
    //ask if create a new one, or reuse a existing one
  }
  return options
  
}
