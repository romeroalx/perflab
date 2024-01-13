/*
 * in the expected configuration there are three machines used for
 * perflab testing:
 *
 * - the backend server which runs the webserver and MongoDB
 * - the server which runs the perflab-tester agent, and the
 *   daemons that are under test
 * - a client machine which sends test traffic to the test server
 *
 * both the web server and the perflab-tester server need access
 * to an appropriately configured settings.js file
 */

'use strict';

module.exports = {

	/*
	 * the location where configurations and test-results are
	 * stored - this should not be same as the the installation
	 * path of the perflab software.
	 */
	path:		'/home/ubuntu/results',

	/*
	 * enter your server host names here
	 */
	hosts: {
		dns: {
			server: 'perflab-server-vm',
			tester: 'perflab-http-vm'
		}
	},

	ports: {
		dns: {
			server: {
				auth: '5301',
				rec: '5353'
			},
			tester: {
				target: '5353'
			}
		}
	},

	/*
	 * if running seperate test servers for different protocols
	 * or servers, the queueFilter can be specified on a per-
	 * server basis to control which programs are tested on that
	 * server.  Omit or set to { } if not required.
	 */
	queueFilter: {},
	// queueFilter: {type: {$in: ['bind', 'echo', 'knot', 'nsd']}},

	/*
	 * alternative version for DHCP testing */
	// queueFilter: {type: {$in: ['dhcpd', 'kea4', 'kea6']}},

	/*
	 * set the source repositories and other per-agent fields here
	 *
	 * each agent permits specification of an optional 'wrapper' which
	 * can be used to wrap the invocation of the daemon under test, e.g.
	 * to force the daemon to run on CPU core 0 and also passing a specific
	 * parameter to the daemon itself
	 *
	 * server: {
	 *   repo: { url: ... },
	 *   args: [ '-i', '<interface_name>' ],
	 *   wrapper: ['/bin/numactl', '-C0']
	 * }
	 *
	 */

	agents: {
		pdns: {
			commands: {
				docker: '/usr/bin/docker'
			},
			args: {
				auth: '',
				rec: '',
			},
			config_folder: './'
		}
	},

	default_scenarios: {
		from_dockerhub: {
			PDNS_BIN_DIR: '/usr/local/sbin',
			PDNS_BACKEND: 'lmdb',
			PDNS_ZONES_DIR: '/etc/powerdns/zones',
			ADDITIONAL_PARAMS_AUTH: '',
			ADDITIONAL_PARAMS_REC: ''
		},
		from_repo: {
			PDNS_BIN_DIR: '/usr/local/sbin',
			PDNS_BACKEND: 'lmdb',
			PDNS_ZONES_DIR: '/etc/powerdns/zones',
			ADDITIONAL_PARAMS_AUTH: '',
			ADDITIONAL_PARAMS_REC: ''
		},
		from_package: {
			PDNS_BIN_DIR: '/usr/sbin',
			PDNS_BACKEND: 'lmdb',
			PDNS_ZONES_DIR: '/etc/powerdns/zones',
			ADDITIONAL_PARAMS_AUTH: '',
			ADDITIONAL_PARAMS_REC: ''
		}
	},

	/*
	 * this section is mandatory and (for those protocols where multiple
	 * traffic generastors are available) sets which program should be
	 * used by default.
	 */
	default_clients: {
		dns: 'dnsperf'
	},

	/*
	 * how many times to run the test traffic generator for each series
	 * (or "run") of tests.  Defaults to 30.   NB:  the results from the
	 * first test in a series is disregarded for stats purposes to allow
	 * the daemon under test to "warm up".
	 */
	testsPerRun: 3,

	/*
	 * for DNS testing, additional sets of dnsperf files can be added
	 * to the UI by adding them to the web server's settings.js file
	 * and then restarting the web server.
	 */
	querysets: {
		authoritative: [
			{	file: 'test_a', name: 'Test Authoritative' }
		],
		recursive: [
			{	file: 'test_b', name: 'Test Recursive' }
		]
	}
};
