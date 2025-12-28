import { get_error_from_code } from "./error.js";
import { ReturnSignal } from "./etc.js";

export const actionDictionary = {
    Program(statements) {
        return statements.children.map(s => s.eval(this.args.env));
    },
    Statement(stmt) {
        return stmt.eval(this.args.env);
    },
    Print(_print, _lp, expr, _rp) {
        const value = expr.eval(this.args.env);
        console.log(value);
        return value;
    },
    Math_add(expr1, _plus, expr2) {
        return expr1.eval(this.args.env) + expr2.eval(this.args.env)
    },
    Math_minus(expr1, _minus, expr2) {
        return expr1.eval(this.args.env) - expr2.eval(this.args.env)
    },
    Math_times(expr1, _times, expr2) {
        return expr1.eval(this.args.env) * expr2.eval(this.args.env)
    },
    Math_divide(expr1, _divide, expr2) {
        return expr1.eval(this.args.env) / expr2.eval(this.args.env)
    },
    VarCreate(type, mut, name, _eq, value) {
        if(typeof value.eval(this.args.env) == type.sourceString) {
            this.args.env[name.sourceString] = {
                type: type.sourceString,
                value: value.eval(this.args.env),
                mutable: mut.sourceString ? true : false,
            }
        } else {
            console.log(`Mismatched Types, Expected ${type.sourceString}, Got ${typeof value.eval(this.args.env)}`)
            throw new Error(get_error_from_code('MISMATCHED_TYPES'))
        }
    },
    VarAssign(name, _eq, value) {
        if(this.args.env[name.sourceString] && this.args.env[name.sourceString].mutable) {
            this.args.env[name.sourceString].value = value
        } else {
            throw new Error(this.args.env[name.sourceString] ? get_error_from_code('NON_MUTABLE') : get_error_from_code('NO_VALUE_FOUND'))
        }
    },
    VarGet(_ot, name, _ct) {
        if(this.args.env[name.sourceString]) {
            return this.args.env[name.sourceString].value
        } else {
            throw new Error(get_error_from_code('NO_VALUE_FOUND'))
        }
    },
    Expr(e) {
        return e.eval(this.args.env);
    },
    number(digits) {
        return Number(digits.sourceString);
    },
    string(_open, chars, _close) {
        return chars.sourceString;
    },
    Fn(typeList, _fn, name, ParameterList, body) {
        ParameterList = ParameterList.eval(this.args.env);
        var functionEnv = this.args.env
        this.args.env[name.sourceString] = {
            properties: typeList.asIteration().children.map(c => c.sourceString),
            body: (parameters) => {
                parameters.forEach((param, index) => {
                
                    functionEnv[ParameterList[index]] = {
                        type: typeof param,
                        mutable: ParameterList[index].mutable,
                        value: param,
                    }
                })

                try {
                    body.eval(functionEnv)
                } catch(error) {
                    if(error instanceof ReturnSignal) {
                        return error.value
                    } else {
                        console.error(error.stack)
                    }
                }
            }
        }
    },
    Parameter(mut, ident) {
        return {
            mutable: mut.sourceString ? true : false,
            name: ident.sourceString, 
        }
    },
    FnCall(_os, name, parameterList, _cs) {
        if(this.args.env[name.sourceString]) {
            return this.args.env[name.sourceString].body(parameterList.eval(this.args.env))
        } else {
            throw new Error(get_error_from_code("NO_VALUE_FOUND"))
        }
    },
    Return(_out, _op, value, _cp) {
        throw new ReturnSignal(value.eval(this.args.env))
    },
    FuncBody(_ob, body, _cb) {
        return body.eval(this.args.env)
    },
    /**
     * 
     * @param {import("ohm-js").Node} _op 
     * @param {import("ohm-js").Node} listOfParams 
     * @param {import("ohm-js").Node} _cp 
     * @returns {Array[string]}
     */
    ParameterList(_op, listOfParams, _cp) {
        return listOfParams.asIteration().children.map(c => c.sourceString)
    },
    StatementParameterList(_op, listOfParams, _cp) {
        return listOfParams.asIteration().children.map(c => c.eval(this.args.env))
    },
    _iter(...children) {
        return children.map(c => c.eval(this.args.env))
    },
}