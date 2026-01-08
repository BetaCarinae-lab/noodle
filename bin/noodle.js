#!/usr/bin/env node

import { readFileSync } from 'fs'
import path from 'path';
import { runBowl, runND } from '../src/exec.js';
import readline from "readline";
import { VERSION } from '../src/info.js';
import { MWD } from '../src/info.js';
import { exit } from 'process';

let env = {}

env.secure = {
    debug: process.argv[3] == '--debug'
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const file_path = path.isAbsolute(process.argv[2])
  ? process.argv[2]
  : path.resolve(process.cwd(), process.argv[2]);

const usingBowl = path.extname(file_path) == ".bowl" ? true : false

if(!process.argv[2]) {
    function repl() {
        console.log('Noodle REPL: ')
        rl.question(">>> ", (code) => {
            console.log('output: \n')
            runND(code, env)
            repl()
        })
    }
    repl()
} else if (process.argv[2] == '--info' || process.argv[3] == '--info') {
    console.log(`
    ------------------------------------------
    ### RunInfo:

    ## Exec Params
    UsingBowl: ${usingBowl}
    Reading: ${file_path}
    Debug: ${env.secure.debug}
    ExplainParse: ${process.argv[3] == '--parseinfo'}

    ## Working Directory and Versions
    NDV: ${VERSION}
    MWD: ${MWD}
    CWD: ${process.cwd()}
    Trying to Read: ${file_path}
    NodeV: ${process.version}
    ------------------------------------------
    `)
    exit(0)
} else if(process.argv[2] == '--help') {
    console.log(`
        Usage: noodle [file | options] [options],
        
        Examples:
        noodle -> Opens Noodle REPL
        noodle --info or noodle ./file.nd --info -> prints run info
        noodle --help -> prints this
        noodle ./file.nd --parseinfo -> Prints ohm match trace, will fill up your terminal
        noodle ./file.nd or noodle ./file.bowl -> runs a nd or bowl file
    `)
    exit(0)
} 
else {




const inputCode = readFileSync(file_path, 'utf-8');

console.log(`
------------------------------------------
### RunInfo:

## Exec Params
UsingBowl: ${usingBowl}
Reading: ${file_path}
Debug: ${env.secure.debug}
ExplainParse: ${process.argv[3] == '--parseinfo'}

## Working Directory and Versions
NDV: ${VERSION}
MWD: ${MWD}
CWD: ${process.cwd()}
Trying to Read: ${file_path}
NodeV: ${process.version}
------------------------------------------
`)


if(usingBowl) {
    runBowl(inputCode)
} else {
    runND(inputCode, env, process.argv[3] == '--parseinfo')
}

exit(0)

}