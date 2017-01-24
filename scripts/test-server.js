#!/usr/bin/env node

'use strict';

let	Database = require('../lib/database'),
	Agents = require('../lib/agents'),
	Promise = require('bluebird'),
	settings = require('../settings');

Promise.longStackTraces();

if (process.argv.length < 3) {
	console.error("please supply a config id");
	process.exit();
}

let id = process.argv[2];
let db = new Database(settings);

db.getConfigById(id).then((config) => {
	config.flags = config.flags || {};
	config.flags.checkout = false;
	let type = config.type;
	let agent = new Agents[type].server(settings, config);
	agent.on('stdout', t => console.log('1:' + t));
	agent.on('stderr', t => console.log('2:' + t));
	return agent.run(config).then(agent.stop);
}).catch(console.trace).then(db.close).then(process.exit);
