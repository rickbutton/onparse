var gauth = require('google-oauth-jwt');
var config = require('./config');
var inbound = require('./inbound');
var outbound = require('./outbound');
var sched = require('./sched');
var cal = require('./cal')
var path = require('path');

var auth = function(callback) {
	gauth.authenticate(
		{
			email: config.serverEmail,
		    keyFile: path.resolve(__dirname, config.keyFile),
		    scopes: ['https://www.googleapis.com/auth/calendar']
		}, function (err, token) {
			if (err) {
				console.log("error on google auth: " + err);
			} else {
				callback(token);
			}
		}
	);
};

auth(function(token) {
	console.log("access: " + token);
	inbound.getSchedEmail(function(err, text) {
		if (err) {
			console.error(err);
		} else {
			if (text) {
				console.log("got text: ");
				console.log(text);
				var processed = sched.getOnOff(text);
				console.log(processed);
				cal.insertCal(token, processed.on, processed.off, function(err) {
					if (err) {
						console.error(err);
					} else {
						console.log("sending outbound notify");
						var msg = text + "\n\n\n";
						msg += JSON.stringify(processed.on) + "\n\n\n";
						msg += JSON.stringify(processed.off) + "\n\n\n";
						outbound.send("ON Work Schedule Update", msg, function(err, info) {
							if (err) {
								console.error(err);
							} else {
								console.log("sent outbound notify");
								console.log(info);
							}
						});
					}
				});
			} else {
				console.log("no schedule email");
			}
		}
	});
});
