const AWS = require('aws-sdk')

const enableQuestion = {
  type: 'confirm',
  name: 'enable-vpc',
  default: false,
  message: 'Do you want to connect to a VPC?'
}

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

const SecurityGroups = VpcId => new AWS.EC2()
  .describeSecurityGroups({
    Filters: [{ Name: 'vpc-id', Values: [VpcId] }]
  }).promise()
  .then( data => data.SecurityGroups )

module.exports = {
  Vpcs,
  Subnets,
  SecurityGroups
}
