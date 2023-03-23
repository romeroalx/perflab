'use strict';

let Agents = require('./agents'),
	Promise = require('bluebird'),
	fs = Promise.promisifyAll(require('fs-extra')),
	os = require('os');

Promise.longStackTraces();

class Tester {

	constructor(settings) {

		let $ENV = process.env;
		
		console.log("in constructor")

		this.run = async function(config) {
			console.log("in run")

			let serverType = config.type;
			let serverClass = Agents.servers[serverType];

			// create server agent pointing at its instance directory
			let path = settings.path + '/tests/' + config._id;
			let server = new serverClass(settings, config, path);

			// remove existing PERFLAB environment variables
			for (let key in $ENV) {
				if (/^PERFLAB_/.test(key)) {
					delete $ENV[key];
				}
			}

			// create new environment variables
			Object.assign($ENV, {
				//PERFLAB_CONFIG_PATH: path,
				PERFLAB_CONFIG_RUNPATH: server.path.run,
				PERFLAB_CONFIG_ID: config._id,
				PERFLAB_CONFIG_NAME: config.name,
				PERFLAB_CONFIG_BRANCH: config.branch,
				PERFLAB_CONFIG_TYPE: config.type,
				PERFLAB_CONFIG_PROTOCOL: serverClass.configuration.protocol
			});

			if (config.mode) {
				$ENV.PERFLAB_CONFIG_MODE = config.mode;
			}

			// checkScripts(config);

			// run the test
			//await fs.mkdirsAsync(server.path.run);
			//await preRun(server, config);
			await doRunA(server, config);
			//await new Promise(resolve => setTimeout(resolve, 300));
			//await postRun(server, config);
		};

		async function doRunA(agent, config) {
			try {
				// start the server running
				let run = await runServerAgent(agent, config);
				await setStatus(config, 'finished');
			} catch (e) {
				console.trace(e);
				await setStatus(config, 'error');
			}

			try {
				if (agent.stop) {
					await agent.stop();
				}
			} catch (e) {
				console.trace(e);
			}
		}

		async function setStatus(config, s)
		{
			return console.log(config._id, s);
		}

		function check(result) {
			if (result.error) {
				let e = result.error;
				delete result.error;
				return e;
			}
			return undefined;
		}

		// starts the daemon under test with the given configuration
		// and stores the execution results in the database
		async function runServerAgent(agent, config)
		{
			try {
				// await setStatus(config, 'building');
				let run = {
					config_id: "6454ceb9e983551575c0acef",
					created: "2023-05-05T10:14:02.575Z",
					updated: "2023-05-05T10:14:02.575Z",
					_id: "12345"
				}
				$ENV.PERFLAB_RUN_ID = run._id;


				var result = {};
				try {
					result = await agent.run(config, run);
				} catch (e) {
					console.log(e)
					result.error = e;
				}
				// return Object.assign(run, result);
			} catch (e) {
				throw e;
			}
		}
	}
}

module.exports = Tester;
