const AWS_REGIONS = [
	{ name: 'US East (N. Virginia)', value:	'us-east-1' },
  { name: 'US East (Ohio)', value: 'us-east-2' },
  { name: 'US West (N. California)', value: 'us-west-1' },
  { name: 'US West (Oregon)', value: 'us-west-2' },
  { name: 'Asia Pacific (Seoul)', value: 'ap-northeast-2' },
  { name: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
  { name: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
  { name: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
  { name: 'EU (Frankfurt)', value: 'eu-central-1' },
  { name: 'EU (Ireland)', value: 'eu-west-1' }
]

module.exports = {
  type: 'list',
  choices: AWS_REGIONS,
  default: 'eu-west-1',
  message: 'Select AWS region were you want to deploy the API'
}
