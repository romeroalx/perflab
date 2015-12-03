#!/usr/bin/env node

'use strict';

let	Database = require('./database.js'),
	BindAgent = require('./bind-agent.js'),
	DNSPerfAgent = require('./dnsperf-agent.js');

const mongoUrl = 'mongodb://localhost/perflab';
const perfPath = '/home/ray/bind-perflab';
const repoUrl = 'ssh://repo.isc.org/proj/git/prod/bind9';

function execute(agent, data) {
	let stdout = '', stderr = '';
	agent.on('stdout', (t) => stdout += t);
	agent.on('stderr', (t) => stderr += t);
	return agent.run().then((result) =>
		Object.assign(data, {
			stdout, stderr, 
			status: result.status
		}));
}

function runBind(agent, config_id)
{
	return db.insertRun({config_id}).then((run) =>
		execute(agent, run).then(db.updateRun));
}

function runTest(agent, run_id)
{
	return db.insertTest({run_id}).then((test) =>
		execute(agent, test).then(db.updateTest));
}

try {
	var db = new Database(mongoUrl);	// NB: hoisted

	db.getConfigByName("Master").then((config) => {

		if (config === null) {
			return Promise.reject(new Error("named config not found"));
		}

		let bind = new BindAgent(config, perfPath, repoUrl);
		let dnsperf = new DNSPerfAgent(config, perfPath);
		let config_id = config._id;

		return runBind(bind, config_id).then((run) => {
			let iter = 10;
			return (function loop() {
				let res = runTest(dnsperf, run._id);
				return --iter ? res.then(loop) : res;
			})();
		}).then(bind.stop);

	}).catch((e) => {
		e.trace();
		console.error(e);
	});

} catch (e) {
	console.error('catch: ' + e);
}