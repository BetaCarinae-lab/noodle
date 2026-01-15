#!/usr/bin/env node

import { readFileSync } from 'fs'
import path from 'path';
import { runBowl, runND } from './exec.js';
import readline from"readline";
import { VERSION } from './info.js';
import { exit } from 'process';


let env = {}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const file_path = path.isAbsolute(process.argv[2] ? process.argv[2] : 't') ? process.argv[2] : path.resolve(process.cwd(), process.argv[2] ? process.argv[2] : 't');

const usingBowl = path.extname(file_path) == ".bowl" ? true : false

if(!process.argv[2]) {
    function repl() {
        console.log('Noodle REPL: ')
        rl.question(">>> ", (code) => {
            if(code.startsWith('exit')) {
                console.log('Use CTRL + C to exit')
            }
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
    ExplainParse: ${process.argv[3] == '--parseinfo'}

    ## Working Directory and Versions
    NDV: ${VERSION}
    DN: ${__dirname}
    FN: ${__filename}
    CWD: ${process.cwd()}
    Trying to Read: ${file_path}
    NodeV: ${process.version}
    ------------------------------------------
    `)
    exit(0)
} else if(process.argv[2] == '--help' || process.argv[2] == '-h' || process.argv[2] == '-help' || process.argv[2] == '--h') {
    console.log(`
        Usage: noodle [file | options] [options],
        
        Examples:
        noodle -> Opens Noodle REPL
        noodle --info or noodle ./file.nd --info -> prints run info
        noodle --help | -h | -help | --h -> prints this
        noodle -v | -version | --v | --version -> Prints Noodle Version
        noodle ./file.nd or noodle ./file.bowl -> runs a nd or bowl file
    `)
    exit(0)
} else if(process.argv[2] == '-v' || process.argv[2] == '--v' || process.argv[2] == '-version' || process.argv[2] == '--version') {
    console.log(`${VERSION}`)
    exit(0)
} else {




const inputCode = readFileSync(file_path, 'utf-8');

console.log(`
------------------------------------------
### RunInfo:

## Exec Params
UsingBowl: ${usingBowl}
Reading: ${file_path}
ExplainParse: ${process.argv[3] == '--parseinfo'}

## Working Directory and Versions
NDV: ${VERSION}
DN: ${__dirname}
FN: ${__filename}
CWD: ${process.cwd()}
Trying to Read: ${file_path}
NodeV: ${process.version}
------------------------------------------
`)


if(usingBowl) {
    runBowl(inputCode)
} else {
    runND(inputCode, env)
}

exit(0)

}