const AWS = require('aws-sdk')
const inquirer = require('inquirer')

const getName = Tags => Tags.find( Tag => Tag.Key === 'Name' ).Value

const cleanVpcObject = Vpc => {
  const VpcId = Vpc.VpcId,
        CidrBlock = Vpc.CidrBlock,
        Name = getName(Vpc.Tags)
  return { VpcId, Name, CidrBlock, IsDefault: Vpc.IsDefault }
}

const cleanSubnetObject = Subnet => {
  const SubnetId = Subnet.SubnetId,
        Name = getName(Subnet.Tags),
        CidrBlock = Subnet.CidrBlock,
        AvailabilityZone = Subnet.AvailabilityZone;

  return { SubnetId, Name, CidrBlock, AvailabilityZone }
}

const Vpcs = () => new AWS.EC2()
  .describeVpcs({}).promise()
  .then( data => data.Vpcs.map(cleanVpcObject) )

const Subnets = VpcId => new AWS.EC2()
  .describeSubnets({
    Filters: [{ Name: 'vpc-id', Values: [VpcId] }]
  }).promise()
  .then( data => data.Subnets.map(cleanSubnetObject) )

const subnetsQuestion = subnets => ({
  type: 'checkbox',
  name: 'SubnetIds',
  message: 'Select subnets to deploy the lambda (recommend 3, one each availability zone)',
  choices: subnets.map( subnet => ({
    name: `(${subnet.SubnetId}) ${subnet.Name} - ${subnet.CidrBlock} on ${subnet.AvailabilityZone}`,
    value: subnet.SubnetId
  })),
  validate: (selection) => {
    if (!selection.length) {
      return 'Select at least one'
    }
    return true;
  }
})

const configureSubnets = options =>
  Subnets(options.VpcId)
    .then(
      subnets => inquirer.prompt(subnetsQuestion(subnets))
    )
    .then( answer => Object.assign({}, options, answer))


const SecurityGroups = VpcId => new AWS.EC2()
  .describeSecurityGroups({
    Filters: [{ Name: 'vpc-id', Values: [VpcId] }]
  }).promise()
  .then( data => data.SecurityGroups )

const securityGroupsQuestions = groups => ({
  type: 'checkbox',
  name: 'SecurityGroupsIds',
  choices: groups.map( group => ({
    name: `(${group.GroupId}) ${group.GroupName} - ${group.Description}`,
    value: group.GroupId
  })),
  message: 'Select security groups to use',
  validate: (selection) => {
    if (!selection.length) {
      return 'Select at least one'
    }
    return true;
  }
})

const configureSecurityGroups = options =>
  SecurityGroups(options.VpcId)
    .then( s => inquirer.prompt(securityGroupsQuestions(s)) )
    .then( a => Object.assign({}, options, a))

const vpcIdQuestion = vpcs => ({
  type: 'list',
  name: 'VpcId',
  choices: vpcs.map( vpc => ({
    name: `${vpc.Name} - ${vpc.CidrBlock} (${vpc.VpcId})`,
    value: vpc.VpcId
  })),
  message: 'Select vpc to use'
})

const configureVpc = options =>
  Vpcs().then( vpcs => inquirer.prompt(vpcIdQuestion(vpcs)) )
    .then( answer => Object.assign({}, options, answer))
    .then( configureSubnets )
    .then( configureSecurityGroups )

module.exports = options =>
  inquirer.prompt({
      type: 'confirm',
      message: 'Do you want to connect with a VPC',
      default: false,
      name: 'connectWithVpc'
  }).then( answers => {
      if (answers.connectWithVpc) {
        return configureVpc(options)
      }
      return options;
    })
