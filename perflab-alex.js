#!/usr/bin/env node

'use strict';

let Database = require('./lib/database'),
	Tester = require('./lib/alex'),
	// Queue = require('./lib/queue-alexis'),
	mongoCF = require('./etc/mongo'),
	settings = require('./etc/settings');

(async function() {

	try {

		// let db = await new Database(mongoCF).init();
		// await db.createIndexes();

		let config = {
			_id: 'aaa',
			type: 'pdns',
			flags: { checkout: false },
			wrapper: [],
			client: 'dnsperf',
			mode: 'authoritative',
			args: { configure: [], make: [], server: [], tester: [] },
			zoneset: 'kilo-small',
			queryset: 'kilo-small',
			options: '',
			global: '',
			notes: '',
			preConfigure: '',
			preBuild: '',
			preRun: '',
			preTest: '',
			postTest: '',
			postRun: '',
			name: 'alex',
			branch: 'main',
			created: '2023-05-15T09:39:05.123Z',
			updated: '2023-05-15T09:56:31.991Z',
			queue: {
				enabled: true,
				repeat: false,
				priority: 0,
				running: true,
				started: '2023-05-15T10:14:02.567Z',
				state: 'test 1/3',
				completed: '2023-05-15T10:13:15.525Z'
			}
		}

		let tester = new Tester(settings);

		try {
			await tester.run(config);
		} catch (e) {
			console.trace(e);
			// db.insertErrorLog(e);
		}

		// let queue = new Queue(settings, tester);

		// await queue.clear();
		// await queue.run();

	} catch (e) {
		console.trace(e);
	}

})();
