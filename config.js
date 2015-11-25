var fs = require('fs');
var path = require('path');
var obj = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf8'));

module.exports = obj;
