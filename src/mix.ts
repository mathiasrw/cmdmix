const RE = {
	keys: /(?<pre>\{)?\{(?<idx>(?:0|[1-9]\d{0,5}))\}(?<post>\})?/g,
};

import {Configuration, Kill} from './types.d.ts';

const cacheIdxUsed: any = {};

export default function (_conf: Configuration, _cmd: string, _args: string[], kill: Kill) {
	//debugger;

	const conf = {..._conf};
	let args = [..._args];
	let cmd = _cmd;

	if (!RE.keys.test(cmd)) {
		cmd = [...cmd.split(' '), '{0}'].join(' ');
	}

	const idxInUse = cacheIdxUsed[cmd] || getIdxUsed(cmd, conf);

	const argsOri = args;

	if (conf.transform && conf.transform.length) {
		args = treatOptions(conf.transform, args, kill) ?? [];
	}

	let data: string[] = [];

	if (conf.explicit) {
		data = [argsOri.join(' '), ...args];
	} else {
		for (let i = 0; i < idxInUse.length; i++) {
			const idx = idxInUse[i];

			// if {0} or last key then provide the rest of the arguments.
			if (0 === +idx || 1 === idxInUse.length - i) {
				data[idx] = args.join(' ');
				continue;
			}

			if (args.length < 1) {
				kill(`Not enough parameters to feed {${idx}}. Passed: ${args.length}, Expected: ${idxInUse.length}`);
			}

			data[idx] = args.shift() ?? '';
		}
	}

	if (conf.wrap) data = data.map((e) => JSON.stringify(e));

	RE.keys.lastIndex = 0;
	const final = cmd.replace(RE.keys, (...x) => {
		const m = x.pop();
		if (m.pre && m.post) return m.pre + m.idx + m.post;
		return data[+m.idx] ?? kill(`Not enough arguments to match {${m.idx}}`);
	});

	if (conf.debug) console.log({idxInUse, data});

	return final;
}

function getIdxUsed(cmd: string, conf: Configuration) {
	const idxAll = [];
	RE.keys.lastIndex = 0;

	let m;
	while ((m = RE.keys.exec(cmd)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === RE.keys.lastIndex) {
			RE.keys.lastIndex++;
		}

		if (!m.groups?.pre) idxAll.push(+(m.groups?.idx || 0));
	}

	if (conf.debug) console.log({idxAll});

	return (cacheIdxUsed['cmd'] = idxAll
		.filter(function (item, i, ar) {
			// Remove duplicates
			return ar.indexOf(item) === i;
		})
		.sort((a, b) => a - b));
}

function treatOptions(_transform: any, _args: string[], kill: any) {
	const transform = [..._transform];
	let args = [..._args];
	while (transform.length) {
		const action: any = transform.shift();
		switch (action.type) {
			case 'split':
				args = args.map((e) => e.split(new RegExp(action.delimiter ?? kill('Error with split'), 'gi'))).flat();
				break;
			case 'trim':
				args = args.map((e) => e.trim());
				break;
			case 'ignore':
				args = args.filter((e) => !new RegExp(action.regex ?? kill('Error with keep'), 'gi').test(e));
				break;
			case 'keep':
				args = args.filter((e) => new RegExp(action.regex ?? kill('Error with ignore'), 'gi').test(e));
				break;
			case 'replace':
				args
					.map((e) =>
						e.replace(
							new RegExp(action.find ?? kill('Find missing from replace'), 'gi'),
							action.replace ?? kill('Replacement missing from replace')
						)
					)
					.flat();
				break;
			default:
				kill('Unknown transformation');
		}
	}
	return args;
}
