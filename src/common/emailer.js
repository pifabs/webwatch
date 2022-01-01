'use strict';


const nodemailer = require('nodemailer');


module.exports = {
	emailer: nodemailer.createTransport
};
