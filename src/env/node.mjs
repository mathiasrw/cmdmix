import {cpus} from 'os';

export function kill(msg = '', code = 1) {
	if (msg) console.error(msg);
	process.exit(code);
}

export function pipeAction(conf, fn) {
	let _a;
	const delimiter = new RegExp((_a = conf.delimiter) !== null && _a !== void 0 ? _a : '\r?\n', 'img');

	return new Promise(function (resolve, reject) {
		const stdin = process.stdin;
		let buff = '';

		//stdin.setEncoding('utf8');
		stdin.on('data', function (chunk) {
			let _a;
			buff += chunk;
			const parts = buff.split(delimiter);
			buff = (_a = parts.pop()) !== null && _a !== void 0 ? _a : '';
			parts.forEach(fn);
		});

		stdin.on('end', function () {
			buff.split(delimiter).forEach(fn);
			resolve(null);
		});

		stdin.on('error', reject);
	});
}

import {execSync} from 'child_process';

// https://www.hacksparrow.com/nodejs/difference-between-spawn-and-exec-of-node-js-child-rocess.html

export function exec(cmd, kill) {
	process.on(`SIGINT`, () => {
		// We don't want SIGINT to kill our process; we want it to kill the
		// innermost process, whose end will cause our own to exit.
	});

	//echo $SHELL
	// process.env.SHELL: '/usr/local/bin/bash',

	/*function exec (cmd) {
		if (process.platform !== 'win32') {
		  var shell = os.platform() === 'android' ? 'sh' : '/bin/sh'
		  return proc.spawn(shell, ['-c', '--', cmd], {
			stdio: 'inherit'
		  })
		}

		return proc.spawn(process.env.comspec || 'cmd.exe', ['/s', '/c', '"' + cmd + '"'], {
		  windowsVerbatimArguments: true,
		  stdio: 'inherit'
		})
	  }*/

try {
		const childProcess = execSync(cmd, {
			//stdio: [process.stdin, process.stdout, process.stderr],
			stdio: [null, process.stdout, process.stderr],
			//shell: '/bin/bash',
		});
	} catch (e) {
		console.error(`Error: ${e.message}. Number of passed parameters: ${process.argv.length - 2}, Number of expected parameters: ${cmd.split(' ').length}`);
		process.exit(1);
	}

	// https://www.hacksparrow.com/nodejs/difference-between-spawn-and-exec-of-node-js-child-rocess.html
}

export default {
	kill,
	pipeAction,
	pipeReady: !process.stdin.isTTY,
	CPUs: () => cpus().length,
	printCmd: !!+process.env.PRINT_CMD,
	simulateCmd: !!+process.env.SIMULATE_CMD,
	argv: process.argv.slice(2),
	exec,
};
