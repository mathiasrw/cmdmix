import {
	assertEquals as equal,
	assertObjectMatch as validObj,
	//assertThrows as doesThrow,
	assertThrows,
} from 'https://deno.land/std@0.110.0/testing/asserts.ts';

import mix from './mix.ts';

const kill = (msg?: string, panic?: number) => {
	if (panic) throw new Error(msg);
	//console.log(msg);
};

function check(cmd: any, args: any, conf: any) {
	return mix(conf, cmd, args, kill);
}

let prefix = '';

function test(expect: string, template: string, _args: string, conf = {}, negative = 0) {
	const args = _args.split(/\s+/);
	Deno.test(`[${prefix}] ${template} ${JSON.stringify(args)} ${negative ? ' negative' : ''}`, () => {
		if (negative) {
			assertThrows(() => {
				equal(check(template, args, conf), expect);
			});
		} else equal(check(template, args, conf), expect);
	});
}

prefix = 'Default';
test('echo a', 'echo {1}', 'a');
test('echo a b c', 'echo {1}', 'a b c');
test('echo b c a', 'echo {2} {1}', 'a b c');
test('echo a b c', 'echo {1} {2} {3}', 'a b c');
test('echo a b c', 'echo {1} {2} {10}', 'a b c');
test('echo b c a', 'echo {2} {10} {1}', 'a b c');

prefix = 'Zero';
test('echo ab c', 'echo {0}', 'ab c');
test('echo ab c', 'echo', 'ab c');

prefix = 'Escape';
test('echo {1} a b c', 'echo {{1}} {2}', 'a b c');
test('echo {{1}} a b c', 'echo {{{1}}} {2}', 'a b c');

prefix = 'Explicit';
test('echo {1} b', 'echo {{1}} {2}', 'a b c', {explicit: 1});
test('echo a b c{1} b', 'echo {0}{{1}} {2}', 'a b c', {explicit: 1});

prefix = 'Cases';
test('echo a b c 123', 'echo {1} 123', 'a b c');
