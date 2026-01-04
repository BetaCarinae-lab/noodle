import { readFileSync } from 'fs'
import path from 'path';
import { runBowl, runND } from './exec.js';

const inputCode = readFileSync(process.argv[2], 'utf-8');
const usingBowl = path.extname(process.argv[2]) == ".bowl" ? true : false

console.log(`
RunInfo:
UsingBowl: ${usingBowl}
Reading: ${process.argv[2]}
NodeV: ${process.version}
`)

let env = {}

if(usingBowl) {
    runBowl(inputCode)
} else {
    runND(inputCode, env)
}