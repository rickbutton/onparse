var config = require('./config');

var getType = function(type) {
	switch (type) {
		case "ON_SALESFLOOR":
			return "Sales Floor";
		case "ON_FITTING_ROOM":
			return "Fitting Room";
		default:
			return type;
	}
}

var getOnOff = function(text, callback) {
	var onRegex = /\w+, (\d\d\/\d\d)\r?\n?(\d\d:\d\d\wM) - (\d\d:\d\d\wM)  WRK\r?\n?(\w+),/g;
	var offRegex = /\w+, (\d\d\/\d\d)\r?\n?Off/g;
	var on = [];
	var off = [];

	var m;
	while ((m = onRegex.exec(text)) != null) {
		if (m.index === onRegex.lastIndex) {
			onRegex.lastIndex++;
		}
		on.push({
			date: m[1],
			begin: m[2],
			end: m[3],
			type: getType(m[4]),
		})
	}

	while ((m = offRegex.exec(text)) != null) {
		if (m.index === offRegex.lastIndex) {
			offRegex.lastIndex++;
		}
		off.push({
			date: m[1],
		});
	}
	return { on: on, off: off };
};

exports.getOnOff = getOnOff;