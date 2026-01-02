import * as ohm from 'ohm-js';
import { readFileSync } from 'fs'
import { actionDictionary } from './semantics.js';

const grammar = ohm.grammar(readFileSync("src/noodle.ohm", "utf-8"));

const inputCode = readFileSync(process.argv[2], 'utf-8');
const semantics = grammar.createSemantics().addOperation('eval(env)', actionDictionary);

/**
 * @type {import('ohm-js').MatchResult}
 */
let matchResult = grammar.match(inputCode);

let env = {};

if(matchResult.succeeded()) {
    console.log("Match Succeeded, Applying Semantics");
    semantics(matchResult).eval(env);
} else {
    console.log(matchResult.message);
}