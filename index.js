#!/usr/bin/env node

const {execSync} = require('child_process');

let args = process.argv.slice(2);
let cmds = args[0].split('%%');

cmds = cmds.map(cmd=>{
	let i = 1;
	//let k = args.slice(i,i+1);
	let k = args.slice(i).join(' ')
	return cmd.replace('%'+i, k)
}) 

const cmd = cmds.join('%');

//console.log(cmd)
const childProcess = execSync(cmd,{stdio: [process.stdin, process.stdout, process.stderr]}); 
