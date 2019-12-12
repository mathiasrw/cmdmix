#!/usr/bin/env node

const {execSync} = require('child_process');

const re = {
	key: /%(\d)/g,
};

let args = process.argv.slice(2);
let cmds = args.shift().split('%%');
let mixKeys = [];

if (!args.length) {
	console.error('Minimum one more parameter is requered');
	process.exit(1);
}

cmds.forEach((cmd) => {
	const replacements = cmd.match(re.key) || [];
	mixKeys = mixKeys.concat(replacements.map((e) => parseInt(e.replace('%', ''))));
});

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

//console.log(cmd);
const childProcess = execSync(cmd,{stdio: [process.stdin, process.stdout, process.stderr]});
