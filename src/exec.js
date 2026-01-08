const { readFileSync } = require("fs")
const { actionDictionary } = require('./semantics.js');
const ohm = require("ohm-js")
const { MWD } = require("./info.js");
const path_module = require("path");

function loadGrammar(filename) {
  let grammarPath;
  let usesrc = process.pkg ? false : true
  if (process.pkg) {
    // When running from pkg executable
    grammarPath = path_module.join(path_module.dirname(process.execPath), filename);
  } else {
    // Running in development
    grammarPath = path_module.join(usesrc ? path_module.dirname(MWD) + '/src/' : path_module.dirname(MWD), filename);
  }
  return readFileSync(grammarPath, "utf-8");
}

const grammars = {
    noodle: ohm.grammar(loadGrammar('/noodle.ohm')),
    bowl: ohm.grammar(loadGrammar('./bowls.ohm')),
}

async function registerJS(path) {
    let { exported } = await import(path)
    return exported
}

function runBowl(code, path) {
    let env = {}
    const bowlDict = {
        Main(entries) {
            return entries.children.map(c => c.eval())
        },

        Entry(_run, path, fileExt) {

            if(fileExt.sourceString == '.nd') {
                //console.log(`go from: ${MWD} to: ${path_module.resolve(path.sourceString + fileExt.sourceString)}`)
                //console.log(path_module.resolve(path.sourceString + fileExt.sourceString))
                let result = runND(readFileSync(path_module.resolve(path.sourceString + fileExt.sourceString), 'utf-8'), env, true)

                env = result.env
                
                return result.exitCode

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

        Log(_log, _oq, text, _cq) {
            console.log('B-OUT: ' + text.sourceString)
        },

        If(_if, entry, expected, _then, torun, _if2, _not, torunifnot) {
            if(entry.eval().value == expected.sourceString) {
                torun.eval()
            } else {
                torunifnot.eval()
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

function runND(inputCode, env_, _fromBowl) {
    let env = env_
    
    const semantics = grammars.noodle.createSemantics().addOperation('eval(env)', actionDictionary);

    /**
    * @type {import('ohm-js').MatchResult}
    */
    let matchResult = grammars.noodle.match(inputCode);

    let exitCode;

    if(matchResult.succeeded()) {
        console.log("Match Succeeded, Applying Semantics");
        exitCode = semantics(matchResult).eval(env);
    } else {
        console.log('noodle error: ' + matchResult.message);
    }

    return {
        env: env,
        exitCode: exitCode
    }
}


module.exports = {
    runBowl,
    runND,
}