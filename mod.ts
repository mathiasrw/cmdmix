import env from './src/env/deno.ts';

import cli from './src/cli.ts';

export default async function invoke() {
	await cli(env);
}

invoke();
