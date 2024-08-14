import {build, stop} from 'https://deno.land/x/esbuild@v0.12.1/mod.js';
import httpFetch from 'https://deno.land/x/esbuild_plugin_http_fetch@v1.0.2/index.js';

const conf = {
	bundle: true,
	entryPoints: ['cli/index.mjs'],
	platform: 'node',
	target: 'node12',
	treeShaking: true,
	format: 'iife',
	plugins: [httpFetch],
	write: true,
	outfile: 'build/cmdmix.js',
};

let {outputFiles} = await build(conf);

await build({...conf, entryPoints: ['cli/index.mjs'], minify: true, outfile: 'build/cmdmix.min.js'});

stop();
