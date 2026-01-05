import { readFileSync } from "fs"
import { actionDictionary } from './semantics.js';
import * as ohm from "ohm-js"

export function runBowl(code) {
    let env = {}
    let bowlDict = {
        Main(entries) {
            return entries.children.map(c => c.eval())
        },

        Entry(_run, path, fileExt) {
            if(fileExt.sourceString == '.nd') {
                env = runND(readFileSync(path.sourceString + fileExt.sourceString, 'utf-8'), env, true)
            } else if (fileExt.sourceString == '.bowl') {
                runBowl(readFileSync(path.sourceString + fileExt.sourceString, 'utf-8'), env)
            } else {
                throw new Error(`Unknown file extension: ${fileExt.sourceString}`)
            }
        },
    }


    let grammar = ohm.grammar(readFileSync('./src/bowls.ohm', 'utf-8'))
    const semantics = grammar.createSemantics().addOperation('eval()', bowlDict)

    const matchResult = grammar.match(code)

    if(matchResult.succeeded()) {
        console.log('Match Succeded, Running Bowl List')
        semantics(matchResult).eval()
    } else {
        console.error('Bowl error: ' + matchResult.message)
    }
}

export function runND(inputCode, env_, _fromBowl) {
    let env = env_
    const grammar = ohm.grammar(readFileSync("src/noodle.ohm", "utf-8"));
    
    const semantics = grammar.createSemantics().addOperation('eval(env)', actionDictionary);

    /**
    * @type {import('ohm-js').MatchResult}
    */
    let matchResult = grammar.match(inputCode);

    if(matchResult.succeeded()) {
        console.log("Match Succeeded, Applying Semantics");
        semantics(matchResult).eval(env);
    } else {
        console.log('noodle error: ' + matchResult.message);
    }

    return env
}