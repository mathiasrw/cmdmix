import {
	assertEquals as equal,
	assertObjectMatch as validObj,
	//assertThrows as doesThrow,
	assertThrows,
} from 'https://deno.land/std@0.110.0/testing/asserts.ts';

import config from './params.ts';

const kill = (msg?: string, panic?: number, passedParams?: number, expectedParams?: number) => {
	throw new Error(`${msg}. Passed parameters: ${passedParams}, Expected parameters: ${expectedParams}`);
};

function check(str: string) {
	let params = str.split(' ');
	return config(params, () => kill("Error message", 1, params.length, 3));
}

let prefix = '';

function test(cmd: string, _out: object, negative = 0, errorInclude = '') {
	const out = {
		...{
			template: 'echo',
			args: ['1', '2', '3'],
		},
		..._out,
	};

	Deno.test(`[${prefix}] ` + cmd + (negative ? ' negative' : ''), () => {
		if (negative) {
			assertThrows(() => {
				validObj(check(cmd), out);
			});
		} else validObj(check(cmd), out);
	});
}

prefix = 'Help';
test('--help echo 1 2 3', {conf: {help: true}});
test('-h --help echo 1 2 3', {conf: {help: true}});
test('-h=abc echo 1 2 3', {conf: {help: true}}, 1);
test('--h echo 1 2 3', {conf: {help: true}}, 0);

prefix = 'Version';
test('--version', {conf: {version: true}, args: [], template: null});
// test("-v", { conf: { version: true }, args: [], template: null }); // Is managed outside of params (and -v is not even assigned to --version 😂)
test('--version echo 1 2 3', {conf: {version: true}});
test('-version=abc echo 1 2 3', {conf: {version: true}}, 1);

prefix = 'Output';
test('--output echo 1 2 3', {conf: {simulate: true}});
test('--o echo 1 2 3', {conf: {simulate: true}});
test('-o --output echo 1 2 3', {conf: {simulate: true}});
// test('-o=abc echo 1 2 3', {conf: {}}, 1); 							// turns out std/flags let flags be assigned data
// test("--output=abc echo 1 2 3", { conf: { simulate: true } }, 1); 	// turns out std/flags let flags be assigned data

prefix = 'Simulate';
test('--simulate echo 1 2 3', {conf: {simulate: true}});

prefix = 'Print';
test('-p echo 1 2 3', {conf: {print: true}});
test('-print echo 1 2 3', {conf: {print: true}}, 1);
test('--print echo 1 2 3', {conf: {print: true}});

prefix = 'No print';
test('-P echo 1 2 3', {conf: {noPrint: true}});
test('-noPrint echo 1 2 3', {conf: {noPrint: true}}, 1);
test('--noPrint echo 1 2 3', {conf: {noPrint: true}});

prefix = 'Wrap';
test('-w echo 1 2 3', {conf: {wrap: true}});
test('-wrap echo 1 2 3', {conf: {wrap: true}}, 1);
test('--wrap echo 1 2 3', {conf: {wrap: true}});
