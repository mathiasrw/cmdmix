import {parseParams} from '../deps.ts';

import {Kill} from './types.d.ts';

const RE = {
	info2x:
		/^(-[^-]*(d|s|f|F|D|T|S|L|z|c)|--(delimiter|split|ignore|filter|keep|delimiter|threads|skip|limit|zero-glue|command))$/,
	info3x: /^(-[^-]*(r)|--(replace))$/,
	command: /^(-[^-]*c|--command)$/,
	splitFlags: /^-[\w]{2,}/,
	threads: /^(-[^-]*T|--threads)$/,
	number: /^["']?\d+["']?$/,
};

export default function config(_args: string[], kill: Kill) {
	let args = [..._args];
	let template = null;

	const options: any = [];
	const transform: any = [];

	while (args.length) {
		if ('' === args[0]) {
			args.shift();
			continue;
		}

		if ('-' !== args[0][0]) {
			template = args.shift();
			break;
		}

		// To get correct order
		if (RE.splitFlags.test(args[0])) {
			let explode = [];
			let flags;
			let assign;
			const assignLocation = args[0].indexOf('=') - 1;
			if (assignLocation < 0) {
				flags = args[0];
			} else {
				flags = args[0].slice(-1 * assignLocation);
				assign = args[0].slice(assignLocation);
			}

			explode = flags
				.split('')
				.slice(1)
				.map((e) => '-' + e);

			if (assign) {
				explode.push(assign);
			}

			args = [...explode, ...args.slice(1)];
		}

		const active = ['' + args.shift()];

		if (RE.threads.test(active[0])) {
			if (args.length < 1 || '-' === args[0][0]) active[0] += '=0';

			if (RE.number.test(args[0])) active[0] += '=' + args.shift();
		}

		if (RE.command.test('' + active[0])) {
			if (args.length < 1) {
				kill(`Expected 1 parameter for the command config, but got ${args.length}`);
			}
			template = args.shift();
		} else if (RE.info2x.test('' + active[0])) {
			if (args.length < 1) {
				kill(`Expected 1 parameter for the config, but got ${args.length}`);
			}
			active.push('' + args.shift());
		} else if (RE.info3x.test('' + active[0])) {
			if (args.length < 1) {
				kill(`Expected 1 parameter for the config, but got ${args.length}`);
			}
			active.push('' + args.shift());
			active.push('' + args.shift());
		}

		const params = getParams(kill, active);

		if (params.replace) {
			if (params._.length !== 1) {
				kill(`Expected 1 parameter for --replace, but got ${params._.length}`);
			}
			transform.push({
				type: 'replace',
				find: params.replace,
				replace: params._.shift(),
			});
			delete params.replace;
		}

		if (params.split) {
			transform.push({type: 'split', delimiter: '' + params.split});
			delete params.split;
		}

		if (params.ignore) {
			transform.push({type: 'ignore', regex: '' + params.ignore});
			delete params.ignore;
		}

		if (params.keep) {
			transform.push({type: 'keep', regex: '' + params.keep});
			delete params.keep;
		}

		if (params.filter) {
			transform.push({type: 'keep', regex: '' + params.filter});
			delete params.filter;
		}

		if (params.trim) {
			transform.push({type: 'trim'});
			delete params.keep;
		}

		if (true === params.command) {
			if (!template) {
				kill(`Expected 1 parameter for --command (-c), but got ${template ? 1 : 0}`);
			}
		} else if (params.command) {
			if (template) kill(`Expected 1 command, but got 2`);
			template = params.command;
		}

		delete params.command;

		Object.keys(params).forEach(function (key) {
			if ('_' === key || typeof params[key] === 'undefined' || params[key] === false) {
				return;
			}
			options[key] = params[key];
		});

		if (template) break;
	}

	if (null === template && !options.help && !options.version) {
		if (args.length < 1) kill(`Expected 1 command, but got ${args.length}`);
		template = args.shift();
	}

	const conf = {...options, transform, kill};
	return {template: template, args, conf};
}

function getParams(kill: any, args: string[]) {
	const conf = parseParams(args, {
		stopEarly: true,
		alias: {
			help: 'h',
			split: 's',
			ignore: 'F',
			keep: 'f',
			trim: 't',
			replace: 'r',
			delimiter: 'D',
			threads: 'T',
			skip: 'S',
			limit: 'L',
			verbose: 'v',
			command: 'c',
			wrap: 'w',
			zeroGlue: 'z',
			explicit: 'e',
			output: 'o',
			print: 'p',
			noPrint: 'P',
		},
		boolean: ['help', 'version', 'trim', 'explicit', 'output', 'simulate', 'print', 'noPrint', 'debug', 'wrap'],
		string: [
			'command',
			'zero-glue',
			'split',
			'delimiter',
			'threads',
			'skip',
			'limit',
			'verbose',
			'ignore',
			'replace',
			'keep',
		],

		unknown: (flag: any) => {
			kill(`Unknown option parameter: ${flag}`);
			return false;
		},
	});

	if (conf.threads) {
		if (0 === conf.threads) {
			conf.threads = conf.env.CPUs();
		} else if (1 < +conf.threads) {
			conf.threads = +conf.threads;
		} else {
			if (conf.command) {
				kill('Please let --threads be a flag or a number instead of: ' + conf.threads);
			}
			conf.command = conf.threads;
		}
	}

	if (conf.skip) {
		if (0 < +conf.skip) {
			conf.skip = +conf.skip;
		} else {
			kill('Please let --skip be a number instead of: ' + conf.skip);
		}
	}

	if (conf.limit) {
		if (0 < +conf.limit) {
			conf.limit = +conf.limit;
		} else {
			kill('Please let --limit be a number instead of: ' + conf.limit);
		}
	}

	if (conf.output) {
		conf.simulate = conf.output;
		delete conf.output;
	}

	for (const key in conf) {
		if (key.length === 1 || false === conf[key]) delete conf[key];

		if (key.indexOf('-') >= 0) {
			let newKey = key
				.slice(1)
				.split('-')
				.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
				.join();
			newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
			conf[newKey] = conf[key];
			delete conf[key];
		}
	}
	return conf;
}
