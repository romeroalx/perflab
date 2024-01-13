'use strict';

let Agents = require('./_base');

class DNSPerfAgent extends Agents.Executor {

	constructor(settings, config) {

		super('dnsperf');

		let agent = settings.agents.dnsperf || {};
		let cmd = agent.command || '/usr/bin/dnsperf';
		let wrapper = agent.wrapper;

		let server = settings.hosts.dns.server;
		let tester = settings.hosts.dns.tester;
		let dns_port = settings.ports.dns.tester.target || '8053';

		config.args = config.args || {};
		let queryset = config.queryset || 'default';

		// look for the QPS value in the output and return it
		let getCount = (results) => {
			if (results.status === 0 && results.stdout) {
				let match = results.stdout.match(/(Queries|Updates) per second:\s+(.*)$/m);
				if (match) {
					results.count = +match[2];
				}
			}
			return results;
		};

		// start 'dnsperf' remotely, passing it the given query set and additional args
		this.run = async () => {
			let args = [].concat(agent.args || []);
			args = args.concat([
				'-s', server, '-p', dns_port, '-S', 1,
				'-l', 30, '-d', `${settings.path}/queryset/${queryset}`
			]);
			args = args.concat(config.args.tester || []);
			let res = await this.ssh(tester, cmd, args, { wrapper });
			return getCount(res);
		};
	}
}

DNSPerfAgent.configuration = {
	name: 'dnsperf',
	protocol: 'dns'
};

module.exports = DNSPerfAgent;
