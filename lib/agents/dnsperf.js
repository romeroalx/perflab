'use strict';

let Agents = require('./_base');

module.exports = class DNSPerfAgent extends Agents.Executor {

	constructor(settings, config) {

		super('dnsperf');

		let path = settings.path;
		let cmd = settings.command.dnsperf || '/usr/bin/dnsperf';
        let wrapper = settings.wrapper.dnsperf;

		let server = settings.hosts.dns.server;
		let tester = settings.hosts.dns.tester;

		config.args = config.args || {};
		let queryset = config.queryset || 'default';

		// look for the QPS value in the output and return it
		let getCount = (results) => {
			if (results.status === 0 && results.stdout) {
				let match = results.stdout.match(/Queries per second:\s+(.*)$/m);
				if (match) {
					results.count = +match[1];
				}
			}
			return results;
		}

		// start 'dnsperf' passing it the given query set and additional args
		this.run = () => {
			let args = [].concat(settings.args.dnsperf || []);
			args = args.concat([
				'-s', server, '-p', 8053, '-S', 1,
				'-l', 30, '-d', `${path}/queryset/${queryset}`
			]);
			args = args.concat(config.args.dnsperf || []);
			return this.ssh(tester, cmd, args, {wrapper}).then(getCount);
		}
	}
};