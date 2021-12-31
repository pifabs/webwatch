'use-strict';


const fs = require('fs').promises;


module.exports = {
	writeFileAsync: fs.writeFile,
	readFileAsync: fs.readFile,
	rmAsync: fs.rm
};