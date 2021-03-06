var moment = require('moment');
var gcal = require('google-calendar');
var fanin = require('fanin');
var config = require('./config');

var insertEvents = function(cal, id, on, off, callback) {
	console.log("Adding events to cal with id: " + id);
	var fan = fanin(on.length, callback);
	for (var i = 0; i < on.length; i++) {
		var start = moment(on[i].date + " " + on[i].begin, 'MM/DD hh:mmA').toDate();
		var end = moment(on[i].date + " " + on[i].end, 'MM/DD hh:mmA').toDate();
		var event = {
			start: { dateTime: start.toISOString() },
			end: { dateTime: end.toISOString() },
			summary: on[i].type,
		};
		cal.events.insert(id, event, function(err, result) {
			fan();
			if (err) {
				console.error(err);
			} else {
				console.log("Saved work event with id: " + result.id);
			}
		});
	}
}

var insertCal = function(token, on, off, callback) {
	var cal = new gcal.GoogleCalendar(token);
	cal.calendarList.list(function(err, calendarList) {
		if (err) {
			console.error(err);
		} else {
			if (calendarList.items.length > 0) {
				console.log("Have " + calendarList.items.length + " calendar(s).");
				var id = null;
				for (var i = 0; i < calendarList.items.length; i++) {
					if (calendarList.items[i].summary == config.calendarName)
						id = calendarList.items[i].id;
				}
				if (id) {
					insertEvents(cal, id, on, off, callback)
				} else {
					callback("didn't find calendar");
				}
			} else {
				callback("didn't find calendar");
			}
		}
	});
};

exports.insertCal = insertCal;