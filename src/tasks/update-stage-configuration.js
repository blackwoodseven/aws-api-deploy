#!/usr/bin/env node
const api = require('../services/api-gateway'),
	_ = require('lodash')

const createOperationsForVariables = (origin, destination) => {
	const mergedVariables = Object.assign({}, destination, origin);
	return _(mergedVariables).map((value, key) => {
		return origin[key] === destination[key] ? null : {
			op : 'replace',
			path: `/variables/${key}`,
			value: key in destination ? destination[key] : null
		}
	}).compact().value()
}

const updateStageImproved = options => {
	const patchOperations = [],
				restApiId = options.restApiId,
				stageName = options.stageName;

	return api.getStage({ restApiId, stageName }).promise()
		.then( data => {
			if (options.deploymentId && options.deploymentId !== data.deploymentId) {
				patchOperations.push({
					op: 'replace',
					path: '/deploymentId',
					value: options.deploymentId
				})
			}
			if (options.variables) {
				createOperationsForVariables(data.variables, options.variables)
					.forEach( op => patchOperations.push(op) )
			}
			return patchOperations.length ? api.updateStage({ restApiId, stageName, patchOperations }).promise() : data
		})
}

module.exports = updateStageImproved
