'use-strict';


const { Schema } = require('mongoose');

const webwatch = require('../../../index');


const siteStatusSchema = new Schema({
	siteId: {
		type: String,
		required: true
	},
	forDate: { type: Date, default: Date.now },
	statuses: [{
		isOnline: {
			type: Boolean
		},
		responseTime: {
			type: Number,
			default: null
		},
		reason:	String,
		createdAt: {
			type: Date,
			default: Date.now
		}
	}],
	createdAt: { type: Date, default: Date.now }
});


siteStatusSchema.pre('save', function() {
	this.endDate = webwatch.utils.addDays(new Date(), 1);
});


siteStatusSchema.statics.getLatestStatus = async function({siteId}) {
	let startDate = webwatch.utils.formatDate({date: new Date()});
	let endDate = webwatch.utils.formatDate({
		date: webwatch.utils.addDays(startDate, 1)
	});
	const result = await this.aggregate([
		{
			$match: {
				siteId,
				forDate: {
					$gte: new Date(startDate),
					$lt: new Date(endDate)
				}
			}
		},
		{$unwind: '$statuses'},
		{
			$replaceRoot: {
				newRoot: '$statuses'
			}
		},
		{
			$project: {
				isOnline: {
					$multiply: [{$toInt: '$isOnline'}, 100]
				},
				createdAt: 1,
				responseTime: 1,
				reason: 1
			}
		},
		{
			$sort: {createdAt: -1}
		},
		{
			$limit: 1
		}
	]);
	return result;
}


siteStatusSchema.statics.getResponsetimeSMA = function({siteId, limit, sort}) {
	// https://www.mongodb.com/developer/article/time-series-candlestick-sma-ema/
	return this.aggregate([
		{
			$match: { siteId }
		},
		{ $unwind: '$statuses' },
		{
			$replaceRoot: { newRoot: '$statuses' }
		},
		{
			$addFields: { 'statuses.siteId': '$siteId' }
		},
		{
			$group: {
				_id: {
					siteId: '$siteId',
					createdAt: {
						$dateTrunc: {
							date: '$createdAt',
							unit: 'minute',
							binSize: 5
						},
					},
				},
				max: { $max: '$responseTime' },
				min: { $min: '$responseTime' },
				first: { $first: '$responseTime' },
				last: { $last: '$responseTime' }
			}
		},
		{
			$sort: { '_id.createdAt': 1 }
		},
		{
			$project: {
				_id: 1,
				responseTime: '$last'
			},
		},
		{
			$setWindowFields: {
				partitionBy: '_id.siteId',
				sortBy: { '_id.createdAt': 1 },
				output: {
					sma30Mins: {
						$avg: '$responseTime',
						window: { range: [-30, 0], unit: 'minute' }
					},
					sma24Hrs: {
						$avg: '$responseTime',
						window: { range: [-24, 0], unit: 'hour' }
					},
					sma30Days: {
						$avg: '$responseTime',
						window: { range: [-30, 0], unit: 'day' }
					}
				}
			}
		},
		sort ? { $sort: sort } : {},
		limit ? { $limit: limit } : {}
	]
	);
}


siteStatusSchema.statics.getHealthSMA = function({siteId, limit, sort}) {
	// https://www.mongodb.com/developer/article/time-series-candlestick-sma-ema/
	return this.aggregate([
		{
			$match: { siteId }
		},
		{
			$addFields: { 'statuses.siteId': '$siteId' }
		},
		{ $unwind: '$statuses' },
		{
			$replaceRoot: { newRoot: '$statuses' }
		},
		{
			$project: {
				isOnline: {
					'$multiply': [{ '$toInt': '$isOnline'}, 100]
				},
				siteId: 1,
				createdAt: 1
			}
		},
		{
			   $group: {
				_id: {
					siteId: '$siteId',
					createdAt: {
						$dateTrunc: {
							date: '$createdAt',
							unit: 'minute',
							binSize: 5
						}
					}
				},
				last: { $last: '$isOnline' }
			},
		},
		{
			$sort: { '_id.createdAt': 1 },
		},
		{
			   $project: {
				_id: 1,
				health: '$last'
			},
		},
		{
			$setWindowFields: {
				partitionBy: '_id.siteId',
				sortBy: { '_id.createdAt': 1 },
				output: {
					sma30Mins: {
						$avg: '$health',
						window: { range: [-30, 0], unit: 'minute' }
					},
					sma24Hrs: {
						$avg: '$health',
						window: { range: [-24, 0], unit: 'hour' }
					},
					sma30Days: {
						$avg: '$health',
						window: { range: [-30, 0], unit: 'day' }
					}
				}
			}
		},
		sort ? { $sort: sort } : {},
		limit ? { $limit: limit } : {}
	]
	);
}


module.exports = siteStatusSchema;
