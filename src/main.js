#!/usr/bin/env node

import { readFileSync } from 'fs'
import path from 'path';
import { runBowl, runND } from './exec.js';
import readline from "readline";

let env = {}

env.secure = {
    debug: process.argv[3] == '--debug'
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
} else {

const inputCode = readFileSync(process.argv[2], 'utf-8');
const usingBowl = path.extname(process.argv[2]) == ".bowl" ? true : false

console.log(`
RunInfo:
UsingBowl: ${usingBowl}
Reading: ${process.argv[2]}
Debug: ${env.secure.debug}
NodeV: ${process.version}
`)


if(usingBowl) {
    runBowl(inputCode)
} else {
    runND(inputCode, env)
}

}