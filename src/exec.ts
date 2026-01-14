import { readFileSync } from "fs"
import { actionDictionary } from './semantics.ts';
import * as ohm from "ohm-js"
import { MWD } from './info.ts';
import * as path_module from "path";

export function loadGrammar(filename: string) {
  let grammarPath;
  grammarPath = './src/' + filename
  console.log(`loading grammar at ${grammarPath}`)
  return ohm.grammar(readFileSync(grammarPath, "utf-8"));
}

export const grammars = {
    noodle: loadGrammar('noodle.ohm'),
    bowl: loadGrammar('bowls.ohm'),
}

export function runBowl(code: string) {
    let env = {}
    const bowlDict = {
        Main(entries: ohm.Node) {
            return entries.children.map(c => c.eval())
        },

        Entry(_run: ohm.Node, path: ohm.Node, fileExt: ohm.Node) {

            if(fileExt.sourceString == '.nd') {
                //console.log(`go from: ${MWD} to: ${path_module.resolve(path.sourceString + fileExt.sourceString)}`)
                //console.log(path_module.resolve(path.sourceString + fileExt.sourceString))
                let result = runND(readFileSync(path_module.resolve(path.sourceString + fileExt.sourceString), 'utf-8'), env)

                env = result.env
                
                return result.exitCode

            } else if (fileExt.sourceString == '.bowl') {

                runBowl(readFileSync(path.sourceString + fileExt.sourceString, 'utf-8'))

            } else {

                throw new Error(`Unknown file extension: ${fileExt.sourceString}`)

            }
        },

        Comment(_hash: ohm.Node, _op: ohm.Node, _cp: ohm.Node) {
            return
        },

        Register(_reg: ohm.Node, path: ohm.Node, ext: ohm.Node, _as: ohm.Node, type: ohm.Node, _op: ohm.Node, override: ohm.Node, _cp: ohm.Node) {
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

        Log(_log: ohm.Node, _oq: ohm.Node, text: ohm.Node, _cq: ohm.Node) {
            console.log('B-OUT: ' + text.sourceString)
        },

        If(_if: ohm.Node, entry: ohm.Node, expected: ohm.Node, _then: ohm.Node, torun: ohm.Node, _if2: ohm.Node, _not: ohm.Node, torunifnot: ohm.Node) {
            if(entry.eval().value == expected.sourceString) {
                torun.eval()
            } else {
                torunifnot.eval()
            }
        },
    } 
    const semantics = grammars.bowl.createSemantics().addOperation('eval()', bowlDict)

    /**
     * @type {ohm.MatchResult}
     */
    const matchResult = grammars.bowl.match(code)

    if(!matchResult.failed()) {
        console.log('Match Succeded, Running Bowl List')
        semantics(matchResult).eval()
    } else {
        console.error('Bowl error: ' + matchResult.message)
    }
}

export function runND(inputCode: string, env_: object) {
    let env = env_
    
    const semantics = grammars.noodle.createSemantics().addOperation('eval(env)', actionDictionary as ohm.ActionDict<unknown>);

    /**
    * @type {import('ohm-js').MatchResult}
    */
    let matchResult = grammars.noodle.match(inputCode);

    let exitCode;

    if(!matchResult.failed()) {
        console.log("Match Succeeded, Applying Semantics");
        exitCode = semantics(matchResult).eval(env);
    } else {
        console.log('noodle error: ' + matchResult.message);
    }

    return {
        env: env,
        exitCode: exitCode,
        matchResult: matchResult
    }
}