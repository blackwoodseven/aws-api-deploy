const AWS = require('aws-sdk')

AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
  apigateway: '2015-07-09',
  iam: '2010-05-08',
  sts: '2011-06-15',
  lambda: '2015-03-31',
  kms: '2014-11-01',
  ec2: '2016-11-15'
};

module.exports = options => {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: options.profile
  })
  AWS.config.update({
    region: options.region
  })
  return options;
}
