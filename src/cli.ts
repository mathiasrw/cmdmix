import helpText from './help.ts';

const version = '_PACKAGE_VERSION_';

import params from './params.ts';

import mix from './mix.ts';

import {Chiqq} from '../deps.ts';

import {Configuration, Env, Kill} from './types.d.ts';

import {dim, gray} from 'https://deno.land/std/fmt/colors.ts';

export default async function (env: Env) {
	if (1 === env.argv.length) {
		if (/^-v|--?version$/i.test(env.argv[0])) return env.kill(version, 0);
		if (/^-h|--?help$/i.test(env.argv[0])) return env.kill(helpText(), 0);
	}

	const {conf, template, args} = params(env.argv, env.kill);

	if (env.printCmd) conf.print = true;

	if (env.simulateCmd) conf.simulate = true;

	if (conf.version) {
		return env.kill(version, 0);
	}

	if (conf.help) {
		return env.kill(helpText(), 0);
	}

	if (!env.pipeReady) {
		mixAndExec(conf, template, args, env);
		return;
	}

	let q = new Chiqq({
		concurrency: +conf.threads || 1,
		retryMax: 0,
		retryCooling: 40,
		retryFactor: 1,
	});

	const done: Promise<unknown>[] = [];

	let runs = conf.limit ?? 0;
	let skips = conf.skip ?? 0;
	await env.pipeAction(conf, (pipeData: string) => {
		if (!pipeData) return;

		if (conf.skip && 0 < skips--) return;

		if (conf.limit && runs-- <= 0) return;

		done.push(
			q.add(() => {
				mixAndExec(conf, [template, ...args].join(' '), [pipeData], env);
			})
		);
	});

	await Promise.all(done);
}

export function mixAndExec(conf: Configuration, template: string, args: string[], env: Env) {
	let cmd = mix(conf, template, args, env.kill);

	if (conf.debug) {
		console.error({conf, template, args, cmd});
	}

	if (conf.simulate) {
		console.log(cmd);
		return;
	}

	if (!conf.noPrint) {
		if (conf.print) console.log(cmd);
		else console.error(`\x1b[2m$ ${cmd}\x1b[22m`);
	}

	env.exec(cmd, env.kill);
}
