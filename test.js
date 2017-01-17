const AWS = require('aws-sdk')
const create = require('./src/commands/create')
create({
  'region' : 'pizza',
  'api-name' : 'banana',
  'function-name' : 'pineapple'
}).then( options => {
  const iam = new AWS.IAM()

  return iam.getRole({ RoleName: 'not_exists' }).promise()
}).then( console.log.bind(console) )
  .catch( err => console.error(err.code) )
