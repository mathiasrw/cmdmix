#!/usr/bin/env node

'hasOwn' in Object || (Object.hasOwn = Object.call.bind(Object.hasOwnProperty));

import env from '../src/env/node.mjs';

//import cli from '../build/ESNEXT/cmdmix.engine.js';
import cli from '../src/cli.ts';

(async () => {
	await cli(env);
})();
