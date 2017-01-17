const shell = require('shelljs'),
			path = require('path'),
			readJson = require('../util/read-json')


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
//which are the required options??

const askMissingParams = ops => {
	const source = ops.source || shell.pwd(),
				packageConfigPath = path.join(source, 'package.json');
	if (! shell.test('-d', source) ) {
		return Promise.reject(
			new Error(
				`${source} is not a folder`
			)
		)
	}
	if (! shell.test('-e', packageConfigPath) ) {
		return Promise.reject(
			new Error(
				`Missing package.json in project folder ${path.resolve(shell.pwd(), source)}`
			)
		)
	}
	return readJson(packageConfigPath)
		.then( packageConfig => {
			if (!packageConfig.dependencies['yaarh-lib']) {
				return Promise.reject(
					new Error(
						'Missing NPM dependency "yaarh-lib" in package.json'
					)
				)
			}
			return Object.assign({}, ops, { name: packageConfig.name } )
		})
}

const requiredProperties = [
	{
		name: 'name',
		type: 'input',
		message: 'API name',
		default: 'package.json project name'
	},
	{
		name: 'createNewRole',
		type: 'confirm',
		message: 'Do you want to create a new role for executing the lambda?',
		default: true
	},
	{
		name: 'roleName',
		type: 'input' || 'list',
		message: 'role that the lambda will execute as',
		default: '${package.json}.name-role',
		choices: AWS.getRoles()
	},
	{
		name: 'timeout',
		type: 'input',
		message: 'Lambda timeout (in seconds)',
		validate: v => {
			if (v < 1) { return 'Timeout should be at least 1s' }
			if (v > 30) { return 'Timeout should can not be greater than 30s' }
			if (v > 1 && v < 30) { return true }
			return 'Timeout should be a number between 1 and 30'
		},
		default: 10
	},
	{
		name: 'memory',
		type: 'list',
		message: 'Lambda memory allocation',
		choices: [128,256, 'etc'],
		default: 128
	},
	{
		name: 'needsVPC',
		type: 'confirm',
		message: 'should the lambda connect with a VPC?',
		default: false
	},
	{
		name: 'vpcId',
		type: 'list',
		message: 'Choose VPC',
		choices: AWS.listVPC()
	},
	{
		name: 'subnetIds',
		type: 'checkbox',
		message: 'Select the subnets for the VPC',
		choices: AWS.listSubnetsForSelectedVPC(),
		validate: v => v.length > 0 || 'select at least one subnet'
	},
	{
		name: 'securityGroup',
		type: 'checkbox',
		message: 'Select securityGroup for VPC',
		choices: AWS.listSegGroupsForVPCAndSubnet(),
		validate: v => v.length > 0 || 'select at least one security group'
	}
]



parseArgs(process.args)
  .then( askMissingParams )
  .then( configure )
  .then( buildPackage )
  .then( getAPIDefinition )
  .then( createLambda )
  .then( createApi )
  .then( createPermissions )
	.then( saveConfiguration )
