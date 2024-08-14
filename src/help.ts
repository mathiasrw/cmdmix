export default function () {
	return `
cmdmix [config parameters] command-template [arguments to the command]
=============================================================

"command-template" is a template for a command that map keys like {1}, {2}, {10} to the 1st, 2nd and 3rd of the arguments before the final command gets executed. The number of the key indicates the order of the keys - not the placement of the argument. If you have more arguments than keys, the last key will contain the rest of the arguments joined by space. The key '{0}' references all arguments joined by space and will not affect the order of keys when mapping to arguments.  

If you pipe data, all arguments after the command will be considered part of the command (joined by space) and will default to let each new line in the input envoke a new execution with the line as argument. Use the --split parameter to reference specific parts of the line being piped by splitting it into several arguments.


Config parameters to treat arguments
====================================

-w  --wrap
Will wrap each argument in double quotes while escaping any double quotes in the content. 

/*
Can be set multiple times and will be applied in the order they are provided. This is done _before_ the mapping of keys to arguments

-s  --split
A regex used to split all arguments. This might grow the number of arguments.

-f  --filter  --keep
Filter out all arguments that does _not_ match the regex. This might shrink the number of arguments.

-F  --ignore
Filter out all arguments that matchs the regex. This might shrink the number of arguments.

-t  --trim
Trim each argument. 
Any whitespace character will be removed from the beginning and end of each argument. 

-r	--replace
Search and replace each argument. Let the next two parameters be a regex to search	 for and then the string to replace with. 

*/

/*

Config parameters relevant to piping data
========================================

-D  --delimiter
Cut up the data being piped into chunks that will be executed separately with a case insensitive multiline regex. Defaults to newline. All empty chunks will be ignored. 

-0
Set the --delimiter to char(0). Useful for managing data from the unix too 'find'

-T  --threads
Set the amount of threads available for executing commands. If set as a flag the limit for concurrent executions will be the amount of CPUs. If a number is provided this will be the limit of concurrent executions.

-S  --skip
A number indicating how many chunks to skip before starting to execute. No empty chunks will be counted. 

-L  --limit
The max amount of times the final command can run (inclusive). To run the 10 first lines set --limit 10

*/

Config parameters available in this version
===========================================

-h  --help
This text.

-v  --version
Print the current version. 
/*
	--debug
	Flag. Will print debugging info.

	-v  --verbose
	A more chatty output. 

	-c  --command
	Let the next parameter be considered the command. Must be the last parameter. 
*/	
-o  --output  --simulate
Echo the final command to the standard output **instead** of executing it. 

-p  --print
Echo the final command to the standard output (instead of the default: standard error) immediately before it is executed.

-P  --noPrint
Do not echo the final command immiediatly before it is executed.

# -z	--zero-glue
# String to use when joining arguments to populate '{0}'. Defaults to " ".

# -e  --explicit
# Map keys to the argument in the exact position as the key number (instead of letting the number of the key indicate the order of the keys). Will let {0} reference arguments joined by space before any split or trim. 


Environment flags
=================

Usefull to affect multiple calls to cmdmix as part of a chain of commands. 


PRINT_CMD=1
Corresponds to setting the --print flag


SIMULATE_CMD=1
Corresponds to setting the --output flag echoing the final command instead of executing it.


Quirks
======

- If the final command needs to have a number inside '{...}' please add an extra layer of '{}'. To get '{4}' plesae, write '{{4}}' in the template. 

- You need to provide the config parameters before the actual command 'cmdmix [config patameters] command [arguments to the command]'

- If the command start with '-' you need to provide it as part of the --command (-c) parameter

- If you use the --command (-c) config parameter you need to use it as the last one of the config parameters.

- {0} references all arguments joined by a space.

- If no key is detected in the command a ' {0}' will be appended and the -w flag set. You are welcome to add a '#' at the end of your command to comment out the effect of this addition

- If the number of parameters passed does not match the number of expected parameters, an error message will be displayed with information about the number of passed parameters and the number of expected parameters.


`
		.replace(/\/\*.*?\*\//gis, '')
		.replace(/(?<=\n)\s*#.*\n/gi, '\n')
		.replace(/\n\n\n\n+/gi, '\n\n\n');
}
