import { readFileSync } from "fs"
import { actionDictionary } from './semantics.js';
import * as ohm from "ohm-js"
import { MWD } from "./info.js";
import * as path_module from "path";

const grammars = {
    noodle: ohm.grammar(readFileSync(MWD + "/" + "noodle.ohm", "utf-8")),
    bowl: ohm.grammar(readFileSync(MWD + "/" + "bowls.ohm", "utf-8")),
}

async function registerJS(path) {
    let { exported } = await import(path)
    return exported
}

export function runBowl(code, path) {
    let env = {}
    const bowlDict = {
        Main(entries) {
            return entries.children.map(c => c.eval())
        },

        Entry(_run, path, fileExt) {

            if(fileExt.sourceString == '.nd') {
                //console.log(`go from: ${MWD} to: ${path_module.resolve(path.sourceString + fileExt.sourceString)}`)
                //console.log(path_module.resolve(path.sourceString + fileExt.sourceString))
                env = runND(readFileSync(path_module.resolve(path.sourceString + fileExt.sourceString), 'utf-8'), env, true)

            } else if (fileExt.sourceString == '.bowl') {

                runBowl(readFileSync(path.sourceString + fileExt.sourceString, 'utf-8'))

            } else {

                throw new Error(`Unknown file extension: ${fileExt.sourceString}`)

            }
        },

        Comment(_hash, _op, _cp) {
            return
        },

        Register(_reg, path, ext, _as, type, _op, override, _cp) {
            if(type.sourceString == 'module') {
                let newenv = runND(readFileSync(path.sourceString + ext.sourceString, 'utf-8'), env)
                if(!override.sourceString) {
                    env = {...newenv, ...env}
                } else {
                    env = {...env, ...newenv}
                }
            } else if(type.sourceString == 'js-module') {
                
            }
        },
    } 
    const semantics = grammars.bowl.createSemantics().addOperation('eval()', bowlDict)

    const matchResult = grammars.bowl.match(code)

    if(matchResult.succeeded()) {
        console.log('Match Succeded, Running Bowl List')
        semantics(matchResult).eval()
    } else {
        console.error('Bowl error: ' + matchResult.message)
    }
}

export function runND(inputCode, env_, _fromBowl) {
    let env = env_
    
    const semantics = grammars.noodle.createSemantics().addOperation('eval(env)', actionDictionary);

    /**
    * @type {import('ohm-js').MatchResult}
    */
    let matchResult = grammars.noodle.match(inputCode);

    if(matchResult.succeeded()) {
        console.log("Match Succeeded, Applying Semantics");
        semantics(matchResult).eval(env);
    } else {
        console.log('noodle error: ' + matchResult.message);
    }

    return env
}