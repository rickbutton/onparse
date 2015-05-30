var nodemailer = require('nodemailer');
var smtp = require('nodemailer-smtp-transport');
var config = require('./config');

var transporter = nodemailer.createTransport(smtp({
	host: config.outbound.server,
	port: config.outbound.port,
	secure: config.outbound.ssl,
	auth: {
		user: config.outbound.auth.user,
		pass: config.outbound.auth.password,
	}	
}));

exports.send = function(subject, text, callback) {
	transporter.sendMail({
		from: config.outbound.auth.user,
		to: config.outbound.to,
		subject: subject,
		text: text,
	}, callback);
};