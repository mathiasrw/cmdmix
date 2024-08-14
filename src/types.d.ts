export interface Configuration {
	kill: Kill;
	debug?: boolean;
	explicit?: boolean;
	trim?: boolean | string;
	simulate?: boolean;
	delimiter?: string;
	threads?: number;
	split?: string;
	filter?: string;
	skip?: number;
	limit?: number;
	print?: boolean;
	noPrint?: boolean;
	version?: boolean;
	help?: boolean;
	wrap?: boolean;
	transform: object[];
}

export interface Env {
	pipeReady: boolean;
	pipeAction: (conf: Configuration, callback: (pipeData: string) => void) => void;
	kill: (msg: string, errorCode?: number) => void;
	CPUs: () => number;
	argv: string[];
	printCmd: boolean;
	simulateCmd: boolean;
	exec: (cmd: string, kill: Kill) => void;
}

export type Args = string[];

export type Kill = (msg: string, errorCode?: number | undefined) => void;
