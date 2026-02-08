import {readFileSync, existsSync, writeFileSync } from "fs"
import { Func, Variable } from "./etc.js";
import { beginDrawing, clearBackground, delta, closeWindow, drawRectangle, drawText, endDrawing, initWindow, IS_KEY_DOWN, windowShouldClose, GET_MOUSE, RIGHT_MOUSE_BUTTON, LEFT_MOUSE_BUTTON } from "./graphics.js";
import { actionDictionary } from './semantics.js';
import { inspect } from "util";
import { Enviroment } from "./etc.js";
import * as ohm from "ohm-js"
import * as path_module from "path";

export function loadGrammar(filename: string) {
  let grammarPath;
  grammarPath = __dirname + '/' + filename
  console.log(`loading grammar at ${grammarPath}`)
  return ohm.grammar(readFileSync(grammarPath, "utf-8"));
}

export const grammars = {
    noodle: loadGrammar('../grammar/noodle.ohm'),
    bowl: loadGrammar('../grammar/bowls.ohm'),
}

export function runBowl(code: string) {
    let env = new Enviroment()
    const bowlDict: ohm.ActionDict<unknown> = {
        Main(entries: ohm.Node) {
            return entries.children.map((c: any) => c.eval())
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
                let newenv = runND(readFileSync(path.sourceString + ext.sourceString, 'utf-8'), env).env
                env.merge(override.sourceString, newenv)
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

export function runND(inputCode: string, env_: Enviroment) {
    const modules = existsSync('./ndconf.json') ? JSON.parse(readFileSync('ndconf.json', 'utf-8')).needs : []
    let env = env_.createChild()
    if(modules.includes('date')) {
        env.new("DATE#", new Func(true, {}, function(params) {
            let date = new Date()
            if(params[0] == "year") {
                return date.getFullYear()
            } else if(params[0] == "month") {
                return date.getMonth()
            } else if(params[0] == "day") {
                return date.getDay()
            } else if(params[0] == "hour") {
                return date.getHours()
            } else if(params[0] == "minutes") {
                return date.getMinutes()
            } else if(params[0] == "seconds") {
                return date.getSeconds()
            }
        }))
    }
    if(modules.includes('math')) {
        env.new("MATH#", new Func(true, {}, function(params) {
            switch(params[0]) {
                case 'trunc':
                    return Math.trunc(params[1])
                case 'sin':
                    return Math.sin(params[1])
                case 'cos':
                    return Math.cos(params[1])
                case 'tan':
                    return Math.tan(params[1])
                case 'imul':
                    return Math.imul(params[1], params[2])
                case 'pi':
                    return Math.PI
                case 'e':
                    return Math.E
                case 'round':
                    return Math.round(params[1])
                case 'floor':
                    return Math.floor(params[1])
                case 'ceil':
                    return Math.ceil(params[1])
                case 'u-rshift':
                    return params[1] >>> params[2]
                case 'rshift':
                    return params[1] >> params[2]
                case 'trunc':
                    return Math.trunc(params[1])
                default:
                    console.error(`Math error, ${params[0]} is an invalid operation type`)
                    break;
            }
        }))
    }
    if(modules.includes('fs')) {
        env.new('FS_READ#', new Func(true, {}, function(params) {
            return readFileSync(params[0], params[1])
        }))
        env.new('FS_WRITE#', new Func(true, {}, function(params) {
            return writeFileSync(params[0], params[1])
        }))
    }
    if(modules.includes('utils')) {
        env.new('GRID#', new Func(true, {}, function(params) {
            return Array.from({ length: params[0] }, () =>
                Array.from({ length: params[1] }, () => params[2] ?? null)
            );
            }
        ))
        env.new('CNV#', new Func(true, {}, function(params) {
            if(typeof params[0] == "string") {
                return new Number(params[0]).valueOf()
            } else if (typeof params[0] == "number") {
                return new String(params[0]).valueOf()
            }
        }))
        
        env.new('ASSERT#', new Func(true, {}, function(params) {
            if(params[0] == params[1]) {
                return true
            } else {
                throw new Error(`ASSERT FAIL: ${params[0]} != ${params[1]}`)
            }
        }))

        env.new('inspect#', new Func(true, {}, function(params) {
            console.log(`Inspecting: ` + inspect(params[0]))
        }))

        env.new('env_inspect#', new Func(true, {}, function(params) {
            console.log('Inspecting ' + params[0] + ': ' + env.exists(params[0]) ? inspect(env.get(params[0])) : 'No value found :(')
        }))

        env.new('RAND#', new Func(true, {}, (_params: any[]) => {return Math.random()}))
    }
    if(modules.includes('graphics')) {
        env.new('GET_MOUSE#', new Func(true, {}, GET_MOUSE))
        env.new('INIT_WINDOW#', new Func(true, {}, initWindow))
        env.new('WINDOW_SHOULD_CLOSE#', new Func(true, {}, windowShouldClose))
        env.new('BEGIN_DRAWING#', new Func(true, {}, beginDrawing))
        env.new('STOP_DRAWING#', new Func(true, {}, endDrawing))
        env.new('IS_KEY_DOWN#', new Func(true, {}, IS_KEY_DOWN))
        env.new('CLEAR_BACKGROUND#', new Func(true, {}, clearBackground))
        env.new('TEXT#', new Func(true, {}, drawText))
        env.new('RECTANGLE#', new Func(true, {}, drawRectangle))
        env.new('CLOSE_WINDOW#', new Func(true, {}, closeWindow))
        env.new('RIGHT_MOUSE#', new Func(true, {}, RIGHT_MOUSE_BUTTON))
        env.new('LEFT_MOUSE#', new Func(true, {}, LEFT_MOUSE_BUTTON))
        env.new('debug_inspect#', new Func(true, {}, (params: any[]) => {
            console.log(inspect(env.get(params[0])))
        }))
        env.new('DELTA#', new Func(true, {}, delta))
    }

    env.new('args', new Variable('args', false, false, process.argv, false))
    
    const semantics = grammars.noodle.createSemantics().addOperation('eval(env)', actionDictionary as ohm.ActionDict<unknown>);

    /**
    * @type {import('ohm-js').MatchResult}
    */
    let matchResult = grammars.noodle.match(inputCode);

    let exitCode;

    if(!matchResult.failed()) {
        //console.log("Match Succeeded, Applying Semantics");
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