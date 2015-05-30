var gauth = require('google-oauth-jwt');
var config = require('./config');
var email = require('./email');
var sched = require('./sched');
var cal = require('./cal')

var auth = function(callback) {
	gauth.authenticate(
		{
			email: config.serverEmail,
		    keyFile: config.keyFile,
		    scopes: ['https://www.googleapis.com/auth/calendar']
		}, function (err, token) {
			callback(token);
		}
	);
};

auth(function(token) {
	console.log("access: " + token);
	email.getSchedEmail(function(err, text) {
		if (err) {
			console.error(err);
		} else {
			if (text) {
				console.log("got text: ");
				console.log(text);
				var processed = sched.getOnOff(text);
				console.log(processed);
				cal.insertCal(token, processed.on, processed.off);
			} else {
				console.log("no schedule email");
			}
		}
	});
});
