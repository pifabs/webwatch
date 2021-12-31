'use-strict';


const { Schema } = require('mongoose');


const channelSchema = new Schema({
	channelId: {
		type: String,
		required: true,
		unique: true
	},
	sites: [{
		url: {
			type: String,
			unique: true
		},
		createdAt: {
			type: Date,
			default: Date.now
		}
	}],
	createdAt: { type: Date, default: Date.now },
});


channelSchema.methods.addSites = function (sites, cb) {
	const site_url_map = this.getSiteMap();

	for(let site of sites) {
		if(!(site.url in site_url_map)) {
			this.sites.push(site);
		}
	}
	return this;
}


channelSchema.methods.getSiteMap = function () {
	const site_url_map = {};
	for(let site of this.sites) {
		site_url_map[site.url] = site;
	}
	return site_url_map;
}


channelSchema.methods.findSiteByUrl = function (url) {
	const site_url_map = this.getSiteMap();
	return site_url_map[url];
}


channelSchema.methods.removeSiteByUrl = function (url) {
	const site = this.findSiteByUrl(url);
	if (site) {
		return this.removeSite(site._id);
	}
}


channelSchema.methods.removeSiteByIndex = function (idx) {
	const site = this.sites[idx];
	console.log(site);
	console.log(site.id);
	if (site) {
		return this.removeSite(site.id);
	}
}


channelSchema.methods.removeSite = function (siteId) {
	return this.sites.id(siteId).remove();
}


module.exports = channelSchema;
