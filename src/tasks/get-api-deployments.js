const apiGateway = require('../services/api-gateway'),
      moment = require('moment'),
      _ = require('lodash')

const getDeployments = ( restApiId, position, items ) =>
	apiGateway.getDeployments({ restApiId, position, limit: 500 }).promise()
		.then( data => {
			const fullList = items ? data.items.concat(items) : data.items
			if (data.position) {
				return getDeployments(restApiId, data.position, fullList)
			} else {
				return fullList.map( item => Object.assign(item, { createdDate: moment(item.createdDate) }))
			}
		})
		.then( fullList => _.sortBy(fullList, 'createdDate').reverse() )


module.exports = restApiId => getDeployments(restApiId)
