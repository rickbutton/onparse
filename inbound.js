var pop = require('poplib');
var config = require('./config');
var MailParser = require('mailparser').MailParser;

exports.getSchedEmail = function(callback) {
	var client = new pop(config.inbound.port, config.inbound.server, {
		tlserrs: false,
		enabletls: true,
		debug: false,
	});

	client.on("error", function(err) {
		console.error(err);
	});
	client.on("invalid-state", function(cmd) {
	        console.error("Invalid state. You tried calling " + cmd);
	});

	client.on("locked", function(cmd) {
	        console.error("Current command has not finished yet. You tried calling " + cmd);
	});

	client.on("connect", function() {
		console.log("connected to pop");
		client.login(config.inbound.email, config.inbound.password);
	});
	client.on("login", function(status, rawdata) {
		if (status) {
			console.log("LOGIN/PASS success");
			client.list();
		} else {
			console.log("LOGIN/PASS failed");
			client.quit();
			callback("login failed");
		}
	});
	client.on("list", function(status, msgcount, msgnumber, data, rawdata) {
		if (status === false) {
			console.log("LIST failed");
			client.quit();
			callback("list failed");
		} else {
			console.log("LIST success with " + msgcount + " element(s)");
			if (msgcount > 0) {
				client.retr(1);
			}
			else {
				client.quit();
				callback(null, null);
			}
		}
	});
	client.on("retr", function(status, msgnumber, data, rawdata) {
		if (status === true) {
			console.log("RETR success for msgnumber " + msgnumber);
			client.quit();
			var mailparser = new MailParser();
			mailparser.on("end", function(mail) {
				client.dele(msgnumber);
				callback(null, mail.text);
			});
			mailparser.write(data);
			mailparser.end();
		} else {
			console.log("RETR failed for msgnumber " + msgnumber);
			client.quit();
		}
	});
	client.on("dele", function(status, msgnumber, data, rawdata) {
		if (status === true) {
			console.log("DELE success for msgnumber " + msgnumber);
			client.quit();
		} else {
			console.log("DELE failed for msgnumber " + msgnumber);
			client.quit();
		}
	});
	client.on("quit", function(status, rawdata) {
		if (status === true) console.log("QUIT success");
		else console.log("QUIT failed");
	});
}
