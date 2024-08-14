import numCpus from 'https://deno.land/x/num_cpus/mod.ts';

import {readAll} from 'https://deno.land/std/io/util.ts';

import {Configuration, Kill} from '../types.d.ts';

export function kill(msg = '', code = 1) {
	if (msg) console.error(msg);
	Deno.exit(code);
}

export function pipeAction(conf: Configuration, fn: (line: string) => void) {
	const delimiter = new RegExp(conf.delimiter ?? '\r?\n', 'img');

	return new Promise(function (resolve, reject) {
		readAll(Deno.stdin)
			.then((buff: ArrayBuffer) => {
				const parts = new TextDecoder().decode(buff);
				parts.split(delimiter).forEach(fn);
				resolve(null);
			})
			.catch(reject);
	});
}

export async function exec(cmd: string) {
	// https://stackoverflow.com/questions/3327013/how-to-determine-the-current-shell-im-working-on#3327022
	// https://deno.land/x/drake@v1.5.0/lib/utils.ts#L213
	// $0 for the win ?

	const p = Deno.run({
		//cmd: ['/bin/sh', '-c', '--', cmd],
		cmd: shArgs(cmd),
		stdin: 'null',
	});
	//{ rid: 3, pid: 30393 }
	const {success, code: errorCode} = await p.status();
	//{ success: true, code: 0 }
	await p.close();

	if (!success) throw errorCode;
	//Output: abcd
}

/** Synthesize platform dependent shell command arguments. */
function shArgs(command: string): string[] {
	if (Deno.build.os === 'windows') {
		return ['PowerShell.exe', '-Command', command];
	} else {
		let shellExe = Deno.env.get('SHELL')!;
		if (!shellExe) {
			shellExe = '/bin/bash';
			/*if (!existsSync(shellExe)) {
		  abort(
			`cannot locate shell: no SHELL environment variable or ${shellExe} executable`,
		  );
		}*/
		}
		return [shellExe, '-c', '--', command];
	}
}

export default {
	kill,
	pipeAction,
	pipeReady: !Deno.isatty(Deno.stdin.rid),
	CPUs: () => 1,
	printCmd: !!+('' + Deno.env.get('PRINT_CMD')),
	simulateCmd: !!+('' + Deno.env.get('SIMULATE_CMD')),
	argv: Deno.args,
	exec,
};
