#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import path from 'path';
import { getAst, runBowl, runND } from './exec.js';
import readline from"readline";
import { VERSION } from './info.js';
import { argv, exit } from 'process';
import { Enviroment } from './etc.js';
import { setup } from './projectSetup.js';
import { installPackage } from './etc.js';

let env = new Enviroment()

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
        noodle init name -> Inits a new noodle project
        noodle ./file.nd or noodle ./file.bowl -> runs a nd or bowl file
        noodle install https://github.com/yournoodlepackage -> Installs a noodle package (WARNING: WIP)
        noodle ./file.nd --ast --writeto filename -> produces an ast of the inputted code and writes it to a ./filename.json (only if --writeto)
    `) 
    exit(0)
} else if(process.argv[2] == '-v' || process.argv[2] == '--v' || process.argv[2] == '-version' || process.argv[2] == '--version') {
    console.log(`${VERSION}`)
    exit(0)
} else if (process.argv[2] == 'init') {
    if(setup(process.argv[3]) == 0) {
        console.log('Done!')
    } else {
        console.log('Failed :(')
    }
    exit(0)
} else if(process.argv[2] == 'install') {
    installPackage(process.argv[3])
    exit(0)
} else if (process.argv[3] == '--ast') {
    const ast = getAst(readFileSync(file_path, 'utf-8'))
    if(!ast) {
        exit(0)
    }
    if(argv[4] == '--writeto') {
        writeFileSync(argv[5] + '.json', JSON.stringify(ast, null, 2), 'utf-8')
        console.log('DONE!')
        console.log('Written to ' + argv[5] + '.json')
    } else {
        console.log(JSON.stringify(ast, null, 2))
    }
    exit(0)
} else {




const inputCode = readFileSync(file_path, 'utf-8');

console.log(`NDV: ${VERSION}`)


if(usingBowl) {
    runBowl(inputCode)
} else {
    runND(inputCode, env)
}

exit(0)

}