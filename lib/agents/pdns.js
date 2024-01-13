'use strict';

let Agents = require('./_base'),
	Promise = require('bluebird'),
	fs = Promise.promisifyAll(require('fs-extra')),
	path = require('path');

// somewhat complicated class that's capable of running the following
// sequence, with dependency checking and user-specified settings
//
// -  git clone 
// -  configure
// -  make
// -  make install
// -  named
//

async function symlinkDirContent(srcdir, destdir) {
	const files = await fs.readdirAsync(srcdir)
	for (const file of files) {
		let target = `${srcdir}/${file}`
		let newPath = `${destdir}/${file}`
		let relLink = path.relative(destdir, target)
		await fs.ensureSymlinkAsync(relLink, newPath)
	}
}

class PdnsAgent extends Agents.Builder {

	constructor(settings, config, path) {

		super('PDNS', path);

		Object.assign(this.path, {
			zone: this.path.run + '/zones'
		});

		let agent = settings.agents.pdns;
		let authHostPort = settings.ports.dns.server.auth || '5301';
		let recHostPort = settings.ports.dns.server.rec || '8053';
		let cmdDocker = agent.commands.docker || '/usr/bin/docker';
		// let cmdAuth = agent.commands.docker || 'opt/pdns-auth/sbin/pdns_server';
		// let cmdAddZones = agent.commands.docker || '/root/scripts/load-zones.sh';
		// let cmdRecursor = agent.commands.rec || '/opt/pdns-recursor/sbin/pdns_recursor';
		// let wrapper = (config.wrapper && config.wrapper.length) ? config.wrapper : agent.wrapper;

		config.args = config.args || {};
		config.mode = config.mode || 'auth';

		let rebuild = !!(config.flags && config.flags.checkout);

		let createEtc = () => fs.mkdirsAsync(this.path.etc);
		let createRun = () => fs.mkdirsAsync(this.path.run);
		// symlink zones so zone write-back does not mangle the original files
		// let emptyZones = () => fs.emptyDirAsync(this.path.zone);
		// let linkZones = () => symlinkDirContent(`${settings.path}/zones`, this.path.zone);

		let emptyRunPath = () => fs.emptyDirAsync(this.path.run);
		let createComposeFile = () => fs.copyAsync(`${agent.config_folder}/docker/docker-compose-${agent.config_folder}.yaml`, `${this.path.build}/docker-compose.yaml`);
		let copyAuthConfig = () => fs.copyAsync(`${agent.config_folder}/docker/etc/pdns`, `${this.path.etc}/pdns`);
		let copyRecursorConfig = () => fs.copyAsync(`${agent.config_folder}/docker/etc/pdns-recursor`, `${this.path.etc}/pdns-recursor`);
		let copyPdnsScripts = () => fs.copyAsync(`${agent.config_folder}/docker/scripts`, `${this.path.run}/scripts`);

		// empties the work directory, then creates the necessary
		// subdirectories for this configuration
		this.target('prepare', '', async () => {
			await this.clean();
			await emptyRunPath();
			await createEtc();
			await createRun();
			// await emptyZones();
			// await linkZones();
		});

		// builds the configuration files for this run
		let genConfigFromDockerhub = async () => {
			await createComposeFile();
			await copyAuthConfig();
			await copyRecursorConfig();
			await copyPdnsScripts();
		};
		let genConfigFromBuild = async () => {
			await createComposeFile();
			await copyAuthConfig();
			await copyRecursorConfig();
			await copyPdnsScripts();
		};
		let genConfigFromPackages = async () => {
			await createComposeFile();
			await copyAuthConfig();
			await copyRecursorConfig();
			await copyPdnsScripts();
		};

		// starts containers
		
		let opts = {
			env: {
				AUTH_HOST_PORT: authHostPort,
				REC_HOST_PORT: recHostPort
			},
			force: true
		};
		this.target('compose', 'prepare', () => this.spawn(cmdDocker, ['compose', '--project-directory=' + this.path.build,
											'up',  '--force-recreate', '-d'], opts));

		let addZones = () => this.spawn(cmdDocker, ['exec', 'perflab-pdns-auth-1', '/tmp/scripts/load-zones.sh'], {});

		this.target('stop', '', () => this.spawn(cmdDocker, ['compose', '--project-directory=' + this.path.build, 'down'], opts));

		// main executor function - optionally does a 'prepare' forcing
		// the entire build sequence to start afresh, then gets the latest
		// commit message and runs BIND, adding the commit message to the
		// BIND result output
		this.run = async () => {
			await this.targets.prepare({force: rebuild});
			await genConfig();

			if (config.auth.source === 'docker-image') {
				await genConfigFromDockerhub();
			} else if (config.auth.source === 'build-from-repo') {
				await genConfigFromBuild();
				await this.targets.startAuth();
			} else if (config.auth.source === 'deb-packages') {
				await genConfigFromPackages();
				await this.targets.startAuth();
			} else {
				throw Error('unknown repo protocol');
			}
			await this.targets.compose();
			// await this.targets.startAuth();
			// await this.targets.startRec();
			// let info = await getInfo();
			let res = await addZones();
			return Object.assign(res);
		};

		// this.stop = async () => {
		// 	console.log('stopping')
		// 	await this.targets.stop();
		// };
	}
}

PdnsAgent.configuration = {
	name: 'PDNS',
	protocol: 'dns',
	subtypes: [ 'authoritative', 'recursive' ],
	string: {
		options: 'pdns.conf options {} statements',
		global: 'pdns.conf global configuration blocks'
	},
};

module.exports = PdnsAgent;
