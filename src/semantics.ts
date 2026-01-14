import { Func, ReturnSignal } from "./etc.js";
import * as ohm from "ohm-js"
import { Variable } from "./etc.js";

type Env = Record<string, Variable | Func>;

type OhmArgs = {
  env: Env;
};

type OhmThis = {
  args: OhmArgs;
};

export const actionDictionary: ohm.ActionDict<unknown> = {
    Program(statements: ohm.Node, _semi: ohm.Node) {
        try {
            statements.children.map(s => s.eval(this.args.env));
        } catch (error) {
            if(error instanceof ReturnSignal) {
                return error
            } else {
                throw new Error(`${error} (${this.source.sourceString})`)
            }
        }
        // clean up
        //console.log('Cleaning up!')
        Object.keys(this.args.env).forEach(key => {
            if(this.args.env[key] && this.args.env[key].persistant) {
                //console.log('Variable is persistant, ignoring')
            } else {
                this.args.env[key] = null;
            }
        })
    },

    Statement(stmt: ohm.Node) {
        return stmt.eval(this.args.env);
    },

    _terminal(this: ohm.TerminalNode) {
        return this.sourceString
    },

    Print(_print: ohm.Node, _lp: ohm.Node, expr: ohm.Node, _rp: ohm.Node) {
        const value = expr.eval(this.args.env);
        if(typeof value == 'object') {
            console.log('OUT: ' + JSON.stringify(value));
        } else {
            console.log('OUT: ' + value);
        }
    },

    Loop(_loop: ohm.Node, expr: ohm.Node, body: ohm.Node) {
        let i = 0
        console.log(expr.eval(this.args.env))
        while(i != expr.eval(this.args.env)) {
            body.eval(this.args.env)
            i++
        }
    },

    Math_parens(_op: ohm.Node, expr: ohm.Node, _cp: ohm.Node) {
        return expr.eval(this.args.env)
    },

    Math_add(expr1: ohm.Node, _plus: ohm.Node, expr2: ohm.Node) {
        return expr1.eval(this.args.env) + expr2.eval(this.args.env)
    },

    Math_minus(expr1: ohm.Node, _minus: ohm.Node, expr2: ohm.Node) {
        return expr1.eval(this.args.env) - expr2.eval(this.args.env)
    },

    Math_times(expr1: ohm.Node, _times: ohm.Node, expr2: ohm.Node) {
        return expr1.eval(this.args.env) * expr2.eval(this.args.env)
    },

    Math_divide(expr1: ohm.Node, _divide: ohm.Node, expr2: ohm.Node) {
        return expr1.eval(this.args.env) / expr2.eval(this.args.env)
    },

    Mut(mut) {
        return mut.sourceString ? true : false
    },

    VarCreate(mut: ohm.Node, pers: ohm.Node, strict: ohm.Node, type: ohm.Node, name: ohm.Node, _eq: ohm.Node, value: ohm.Node) {
        if(type.sourceString == "any" || typeof value.eval(this.args.env) == type.sourceString || (type.sourceString == 'array' && Array.isArray(value.eval(this.args.env)))) {
            this.args.env[name.sourceString] = new Variable(name.eval(this.args.env), mut.eval(this.args.env), pers.eval(this.args.env), value.eval(this.args.env), strict.sourceString ? true : false)
        } else {
            throw new Error(`Mismatched Types, Expected ${type.sourceString}, Got ${typeof value.eval(this.args.env)}`)
        }
    },

    VarAssign(name: ohm.Node, _eq: ohm.Node, value: ohm.Node) {
        if(this.args.env[name.sourceString]) {
            this.args.env[name.sourceString].set(value)
        } else {
            console.error(`Can't find ${name.sourceString}`)
        }
    },

    TryCatch(_try: ohm.Node, trybody: ohm.Node, _catch: ohm.Node, _op: ohm.Node, errorname: ohm.Node, _cp: ohm.Node, catchbody: ohm.Node) {
        try {
            trybody.eval(this.args.env)
        } catch(error: any) {
            if(errorname.sourceString) {
                let catchbodyenv = this.args.env
                catchbodyenv[errorname.sourceString] = error
                catchbody.eval(catchbodyenv)
            } else {
                catchbody.eval(this.args.env)
            }
        }
    },

    Reference(_a: ohm.Node, id: ohm.Node) {
        return {references: id.sourceString}
    },

    RefResolve(_pipe: ohm.Node, id: ohm.Node, _pipe2: ohm.Node) {
        return this.args.env[this.args.env[id.sourceString].get().references]
    },

    VarGet(_ot: ohm.Node, name: ohm.Node, _ct: ohm.Node) {
        if(typeof name.eval(this.args.env) == 'object') {
            return name.eval(this.args.env).get()
        } else {
            if(this.args.env[name.sourceString]) {
                return this.args.env[name.sourceString].get()
            } else {
                throw new Error(`No value found with name: ${name.eval(this.args.env)}`)
            }
        }
    },

    ident(first: ohm.Node, rest: ohm.Node) {
        return first.sourceString + rest.sourceString
    },

    Expr(e: ohm.Node) {
        return e.eval(this.args.env);
    },

    number(digits: ohm.Node) {
        if(digits.sourceString == 'inf') {
            return Infinity
        } else {
            return Number(digits.sourceString);
        }
    },

    ExitValues(value: ohm.Node) {
        return value.sourceString
    },

    string(_open: ohm.Node, chars: ohm.Node, _close: ohm.Node) {
        return chars.sourceString;
    },

    Fn(persistant: ohm.Node, _fn: ohm.Node, name: ohm.Node, ParameterList: ohm.Node, body: ohm.Node) {
        ParameterList = ParameterList.eval(this.args.env);
        var functionEnv = this.args.env
        this.args.env[name.sourceString] = new Func(
            persistant.sourceString ? true : false, 
            (parameters: any[]) => {
                parameters.forEach((param, index) => {
                    functionEnv[ParameterList[index].replace('mut ', '')] = {
                        type: typeof param,
                        mutable: ParameterList[index].startsWith('mut '),
                        value: param,
                    }
                })

                try {
                    body.eval(functionEnv)
                } catch(error: any) {
                    if(error instanceof ReturnSignal) {
                        return error.value
                    } else {
                        console.error(error.stack)
                    }
                }
            }
        )
    },

    Array(_ob: ohm.Node, values: ohm.Node, _cb: ohm.Node) {
        return values.asIteration().children.map(c => c.eval(this.args.env))
    },

    ArrayAccess(_ot: ohm.Node, id: ohm.Node, _at: ohm.Node, index: ohm.Node, _ct: ohm.Node) {
        if(this.args.env[id.sourceString]) {
            return this.args.env[id.sourceString].get()[index.eval(this.args.env)]
        } else {
            throw new Error(`No Value Found with name: ${id.sourceString}`)
        }
    },

    Comment(_: ohm.Node, _op: ohm.Node, _txt: ohm.Node, _cp: ohm.Node) {
        return
    },

    Parameter(mut: ohm.Node, ident: ohm.Node, _thing, type) {
        return {
            mutable: mut.sourceString ? true : false,
            type: type.sourceString,
            name: ident.sourceString, 
        }
    },

    Delete(_delete: ohm.Node, id: ohm.Node) {
        if(this.args.env[id.sourceString] && this.args.env[id.sourceString].isMutable()) {
            this.args.env[id.sourceString] = "deleted by program"
        } else {
            throw new Error(`Can't delete if variable ${id.sourceString} doesn't exist!`)
        }
    },

    Exit(_ex: ohm.Node, uhoh: ohm.Node) {
        throw new ReturnSignal(uhoh.eval(this.args.env))
    },

    Exists(id: ohm.Node, _exists: ohm.Node) {
        return this.args.env[id.sourceString] ? true : false
    },

    True(_val: ohm.Node) {
        return true
    },

    False(_val: ohm.Node) {
        return false
    },

    BooleanOperators_eq(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) == s2.eval(this.args.env)
    },

    BooleanOperators_deepEq(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) === s2.eval(this.args.env)
    },

    BooleanOperators_and(s1: ohm.Node, _and: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) && s2.eval(this.args.env)
    },

    BooleanOperators_or(s1: ohm.Node, _or: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) || s2.eval(this.args.env)
    },
    
    BooleanOperators_xor(s1: ohm.Node, _cc: ohm.Node, s2: ohm.Node) {
        return !(s1.eval(this.args.env) === s2.eval(this.args.env))
    },

    BooleanOperators_greater(s1: ohm.Node, _arrow: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) > s2.eval(this.args.env)
    },

    BooleanOperators_less(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) < s2.eval(this.args.env)
    },

    BooleanOperators_greatereq(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) >= s2.eval(this.args.env)
    },

    BooleanOperators_lesseq(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) <= s2.eval(this.args.env)
    },

    BooleanOperators_not(_: ohm.Node, s: ohm.Node) {
        return !s.eval(this.args.env)
    },

    If(_if: ohm.Node, _op: ohm.Node, condition: ohm.Node, _cp: ohm.Node, body: ohm.Node, _else: ohm.Node, elseBody: ohm.Node) {
        if(_else.sourceString) {
            if(condition.eval(this.args.env)) {
                body.eval(this.args.env)
            } else {
                elseBody.eval(this.args.env)
            }
        } else {
            if(condition.eval(this.args.env)) {
                body.eval(this.args.env)
            }
        }
    },

    Math_negate(_m: ohm.Node, value: ohm.Node) {
        return -value.eval(this.args.env)
    },

    //                     hehe
    Math_increment(ident_untrimmed: ohm.Node, _pp: ohm.Node) {
        let ident = ident_untrimmed.sourceString.replace('&', '')
        if(this.args.env[ident] && this.args.env[ident].isMutable()) {
            this.args.env[ident].value++
        } else {
            throw new Error(this.args.env[ident] ? 'Value is not mutable!': `No value found with name: ${ident}`)
        }
    },

    Math_decrement(ident_untrimmed: ohm.Node, _pp: ohm.Node) {
        let ident = ident_untrimmed.sourceString.replace('&', '')
        if(this.args.env[ident] && this.args.env[ident].isMutable()) {
            this.args.env[ident].value--
        } else {
            throw new Error(this.args.env[ident].isMutable() ? `No value found with name: ${ident}` : 'Value is not mutable!')
        }
    },

    FnCall(_os: ohm.Node, name: ohm.Node, parameterList: ohm.Node, _cs: ohm.Node) {
        if(this.args.env[name.sourceString]) {
            return this.args.env[name.sourceString].body(parameterList.eval(this.args.env))
        } else {
            throw new Error(`Cannot find function with name: ${name.sourceString}`)
        }
    },

    Return(_out: ohm.Node, _op: ohm.Node, value: ohm.Node, _cp: ohm.Node) {
        throw new ReturnSignal(value.eval(this.args.env))
    },

    FuncBody(_ob: ohm.Node, body: ohm.Node, _cb: ohm.Node) {
        return body.eval(this.args.env)
    },

    ParameterList(_op: ohm.Node, listOfParams: ohm.Node, _cp: ohm.Node) {
        return listOfParams.asIteration().children.map(c => c.sourceString)
    },

    StatementParameterList(_op: ohm.Node, listOfParams: ohm.Node, _cp: ohm.Node) {
        return listOfParams.asIteration().children.map(c => c.eval(this.args.env))
    },

    _iter(...children) {
        return children.map((c: any) => c.eval(this.args.env))
    },

    ObjectPropertyAccess(_ob: ohm.Node, objectProperty: ohm.Node,_cb: ohm.Node) {
        return objectProperty.eval(this.args.env)
    },

    ObjectProperty(Mid: ohm.Node, _d: ohm.Node, ids: ohm.Node) {
        if(this.args.env[Mid.sourceString].get() && typeof this.args.env[Mid.sourceString].get() == 'object') {
            let value = this.args.env[Mid.sourceString].get()
            ids.asIteration().children.forEach((id) => {
                value = value[id.sourceString]
            })
            return value
        } else {
            throw new Error(`Either can\'t find value ${Mid.sourceString}, or value is not an object`)
        }
    },

    MethodCall(_1: ohm.Node, objProp: ohm.Node, ParamList: ohm.Node, _2: ohm.Node) {
        let fn = objProp.eval(this.args.env)
        try {
            fn.body(ParamList.eval(this.args.env))
        } catch(error: any) {
            if(error instanceof ReturnSignal) {
                return error.value
            } else {
                throw new Error(error.stack)
            }
        }
    },

    Template(persistant: ohm.Node, _temp: ohm.Node, name: ohm.Node, body: ohm.Node) {
        let constructorArgs = body.eval(this.args.env)
        type parameterList = {
            values: any[],
            refers: string[]
        }
        if(!this.args.env[name.sourceString]) {
            this.args.env[name.sourceString] = {
                persistant: persistant.sourceString ? true : false,
                construct: (parameters: parameterList) => {
                    const returnedObject: { [key: string]: any } = {}
                    parameters.values.forEach((value: any, index: number) => {
                        returnedObject[parameters.refers[index]] = value
                    })
                    Object.keys(constructorArgs).forEach(key => {
                        // include methods in the object
                        if(!constructorArgs[key].property) {
                            returnedObject[key] = constructorArgs[key]
                        }
                    })

                    return returnedObject
                }
            }
        } else {
            throw new Error(`${name} already exists!`)
        }
    },

    TemplateConstruction(id: ohm.Node, objectBody: ohm.Node) {
        if(this.args.env[id.sourceString]) {
            return this.args.env[id.sourceString].construct(objectBody.eval(this.args.env))
        }
    },

    ObjectBody(_ob: ohm.Node, name: ohm.Node, _dingdong: ohm.Node, statement: ohm.Node, _: ohm.Node, _cb: ohm.Node) {
        return {
            values: statement.eval(this.args.env),
            refers: name.asIteration().children.map(c => c.sourceString)
        }
    },

    TemplateBody(_ob: ohm.Node, properties: ohm.Node, _cb: ohm.Node) {
        const returnedObject: { [key: string]: any } = {}
        properties.children.forEach((property, index) => {
            property = property.eval(this.args.env)
            if(property.property) {
                returnedObject[property.name] = property
            } else {
                returnedObject[property.name] = property
            }
        })

        return returnedObject
    },

    Property(mut: ohm.Node, _prop: ohm.Node, id: ohm.Node, _is: ohm.Node, type: ohm.Node, _: ohm.Node) {
        return {
            property: true,
            name: id.sourceString,
            mutable: mut.sourceString ? true : false,
            type: type.sourceString
        }
    },

    Method(_method: ohm.Node, id: ohm.Node, _is: ohm.Node, paramList: ohm.Node, funcBody: ohm.Node) {
        paramList = paramList.eval(this.args.env);
        var methodEnv = this.args.env
        let returned = {
            property: false,
            name: id.sourceString,
            body: (parameters: any[]) => {
                parameters.forEach((param, index) => {
                    methodEnv[paramList[index].replace('mut ', '')] = {
                        type: typeof param,
                        mutable: paramList[index].startsWith('mut '),
                        value: param,
                    }
                })

                try {
                    funcBody.eval(methodEnv)
                } catch(error: any) {
                    if(error instanceof ReturnSignal) {
                        return error.value
                    } else {
                        console.error(error.stack)
                    }
                }
            }
        }
        return returned
    },                                    
}