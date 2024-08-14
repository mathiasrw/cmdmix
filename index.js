#!/usr/bin/env node

const {execSync} = require('child_process');

const re = {
	key: /%(\d)/g,
};

let args = process.argv.slice(2);

if (!args.length) {
	throw 'Please provide the command to be executed';
}

let cmds = args.shift().split('%%');
let mixKeys = [];

cmds.forEach((cmd) => {
	const replacements = cmd.match(re.key) || [];
	mixKeys = mixKeys.concat(replacements.map((e) => parseInt(e.replace('%', ''))));
});

if (+process.env.CMDMIX_STRICT && mixKeys.length !== args.length) {
	throw `${args.leng} input parameters provided but ${mixKeys.length} required`;
}

mixKeys = [...new Set(mixKeys)].sort();

let mixIns = [];

for (let i = 0; i < mixKeys.length; i++) {
	let input = args.slice(i, i + 1);

	if (i === mixKeys.length - 1) {
		input = args.slice(i);
	}

	mixIns.push({
		input: input.join(' '),
		n: mixKeys[i],
	});
}

cmds = cmds.map((cmd) => {
	mixIns.forEach((mix) => {
		cmd = cmd.replace(new RegExp('%' + mix.n, 'g'), mix.input);
	});

	return cmd;
});

const cmd = cmds.join('%');
try {
	if (!!+process.env.PRINT_CMD || !!+process.env.CMDMIX_PRINT_CMD) console.warn('$ ' + cmd);
	execSync(cmd, {
		stdio: [process.stdin, process.stdout, process.stderr],
		shell: process.env.CMDMIX_SHELL || '/bin/bash',
	});
} catch (e) {
	if (e.message && 'null' !== e.message) console.error(e.message);
	process.exit(+process.env.CMDMIX_IGNORE_ERROR ? 0 : 1);
}
