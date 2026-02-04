import { Enviroment, Func, ReturnSignal, Template } from "./etc.js";
import * as ohm from "ohm-js"
import { Variable } from "./etc.js";    
import promptSync from 'prompt-sync';
import * as fs from 'fs'
// don't delete!, this is used for debugging!
import { inspect } from "node:util";
import { beginDrawing, clearBackground, closeWindow, drawRectangle, drawText, endDrawing, initWindow, IS_KEY_DOWN, windowShouldClose } from "./graphics.js";

export const actionDictionary: ohm.ActionDict<unknown> = {
    Program(statements: ohm.Node) {
        this.args.env.set("DATE#", new Func(true, this.args.env, function(params) {
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
        this.args.env.set("MATH#", new Func(true, this.args.env, function(params) {
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
                default:
                    console.error(`Math error, ${params[0]} is an invalid operation type`)
                    break;
            }
        }))
        this.args.env.set('CNV#', new Func(true, this.args.env, function(params) {
            if(typeof params[0] == "string") {
                return new Number(params[0]).valueOf()
            } else if (typeof params[0] == "number") {
                return new String(params[0]).valueOf()
            }
        }))
        this.args.env.set('ASSERT#', new Func(true, this.args.env, function(params) {
            if(params[0] == params[1]) {
                return true
            } else {
                throw new Error(`ASSERT FAIL: ${params[0]} != ${params[1]}`)
            }
        }))
        this.args.env.set('FS_READ#', new Func(true, this.args.env, function(params) {
            return fs.readFileSync(params[0], params[1])
        }))
        this.args.env.set('INIT_WINDOW#', new Func(true, this.args.env, initWindow))
        this.args.env.set('WINDOW_SHOULD_CLOSE#', new Func(true, this.args.env, windowShouldClose))
        this.args.env.set('BEGIN_DRAWING#', new Func(true, this.args.env, beginDrawing))
        this.args.env.set('STOP_DRAWING#', new Func(true, this.args.env, endDrawing))
        this.args.env.set('IS_KEY_DOWN#', new Func(true, this.args.env, IS_KEY_DOWN))
        this.args.env.set('CLEAR_BACKGROUND#', new Func(true, this.args.env, clearBackground))
        this.args.env.set('TEXT#', new Func(true, this.args.env, drawText))
        this.args.env.set('RECTANGLE#', new Func(true, this.args.env, drawRectangle))
        this.args.env.set('CLOSE_WINDOW#', new Func(true, this.args.env, closeWindow))
        try {
            statements.children.map(s => {
                s.eval(this.args.env)
            });
        } catch (error: any) {
            if(error instanceof ReturnSignal) {
                return error
            } else {
                console.error(`${error.stack} (line: ${this.source.getLineAndColumn().lineNum})`)
            }
        }
        // clean up
        this.args.env.cleanUp()
    },

    Statement(stmt: ohm.Node) {
        return stmt.eval(this.args.env);
    },

    _terminal(this: ohm.TerminalNode) {
        return this.sourceString
    },

    Plop(_plop, ctxtopush: ohm.Node, _op, pers, mut, strict, _cp) {
        let v = ctxtopush.eval(this.args.env)
        this.args.env.set(v.final, new Variable(v.final, mut.sourceString ? true : false, pers.sourceString ? true : false, v.value, strict.sourceString ? true : false))
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
        //console.log(expr.eval(this.args.env))
        while(i != expr.eval(this.args.env)) {
            body.eval(this.args.env)
            i++
        }
    },

    Primary_parens(_op: ohm.Node, expr: ohm.Node, _cp: ohm.Node) {
        return expr.eval(this.args.env)
    },

    Additive_add(expr1: ohm.Node, _plus: ohm.Node, expr2: ohm.Node) {
        return expr1.eval(this.args.env) + expr2.eval(this.args.env)
    },

    Additive_minus(expr1: ohm.Node, _minus: ohm.Node, expr2: ohm.Node) {
        return expr1.eval(this.args.env) - expr2.eval(this.args.env)
    },

    Multiplicative_times(expr1: ohm.Node, _times: ohm.Node, expr2: ohm.Node) {
        return expr1.eval(this.args.env) * expr2.eval(this.args.env)
    },

    Multiplicative_divide(expr1: ohm.Node, _divide: ohm.Node, expr2: ohm.Node) {
        return expr1.eval(this.args.env) / expr2.eval(this.args.env)
    },

    Multiplicative_powerof(expr1: ohm.Node, _carrot, expr2: ohm.Node) {
        return expr1.eval(this.args.env) ^ expr2.eval(this.args.env)
    },

    Multiplicative_mod(expr1: ohm.Node, _percent, expr2: ohm.Node) {
        return expr1.eval(this.args.env) % expr2.eval(this.args.env)
    },

    Binary_urightshift(expr1: ohm.Node, _leftleftleft, expr2: ohm.Node) {
        return expr1.eval(this.args.env) >>> expr2.eval(this.args.env)
    },

    Binary_rightshift(expr1: ohm.Node, _leftleftleft, expr2: ohm.Node) {
        return expr1.eval(this.args.env) >> expr2.eval(this.args.env)
    },

    Mut(mut) {
        return mut.sourceString ? true : false
    },

    While(_while, _op, expr, _cp, body) {
        while(expr.eval(this.args.env)) {
            body.eval(this.args.env)
        }
    },

    VarCreate(mut: ohm.Node, pers: ohm.Node, strict: ohm.Node, type: ohm.Node, name: ohm.Node, _eq: ohm.Node, value: ohm.Node) {
        if(type.sourceString == "any" || typeof value.eval(this.args.env) == type.sourceString || (type.sourceString == 'array' && Array.isArray(value.eval(this.args.env)))) {
            this.args.env.set(name.sourceString, new Variable(name.eval(this.args.env), mut.eval(this.args.env), pers.eval(this.args.env), value.eval(this.args.env), strict.sourceString ? true : false))
        } else {
            throw new Error(`Mismatched Types, Expected ${type.sourceString}, Got ${typeof value.eval(this.args.env)}`)
        }
    },

    VarAssign(name: ohm.Node, _eq: ohm.Node, value: ohm.Node) {
        if(this.args.env.exists(name.sourceString) || typeof name.eval(this.args.env) == 'object') {
            // Handle Object Property Reassigning
            if(typeof name.eval(this.args.env) == "object") {
                let ids = name.eval(this.args.env)
                let idList: string[] = ids.ids.asIteration().children.map((c: ohm.Node) => c.sourceString)
                let obj = this.args.env.get(ids.Mid).get();
                let current = obj;

                for (let i = 0; i < idList.length - 1; i++) {
                    const key = idList[i];

                    if (
                        typeof current[key] !== "object" ||
                        current[key] === null
                    ) {
                        current[key] = {};
                    }

                    current = current[key];
                }

                current[idList[idList.length - 1]] = value.eval(this.args.env);

                //console.log(current[idList[idList.length - 1]])

            } else {
                this.args.env.set(name.eval(this.args.env), new Variable(
                    name.sourceString,
                    this.args.env.get(name.sourceString).mutable,
                    this.args.env.get(name.sourceString).persistant,
                    value.eval(this.args.env),
                    this.args.env.get(name.sourceString).strict,
                ))
            }
        } else {
            console.error(`Can't find ${name.eval(this.args.env)}`)
        }
    },

    TryCatch(_try: ohm.Node, trybody: ohm.Node, _catch: ohm.Node, _op: ohm.Node, errorname: ohm.Node, _cp: ohm.Node, catchbody: ohm.Node) {
        try {
            trybody.eval(this.args.env)
        } catch(error: any) {
            if(errorname.sourceString) {
                let catchbodyenv = this.args.env.createChild()
                catchbodyenv[errorname.sourceString] = error
                catchbody.eval(catchbodyenv)
            } else {
                catchbody.eval(this.args.env)
            }
        }
    },

    Reference(_a: ohm.Node, id: ohm.Node) {
        
    },

    RefCreate(id: ohm.Node, _coolthing_, id2: ohm.Node) {
        this.args.env.reference(id.sourceString, id2.sourceString)
    },

    RefResolve(_pipe: ohm.Node, id: ohm.Node, _pipe2: ohm.Node) {
        
    },

    VarGet(_ot: ohm.Node, name: ohm.Node, _ct: ohm.Node) {
        if(typeof name.eval(this.args.env) == 'object') {
            return name.eval(this.args.env).get()
        } else {
            if(this.args.env.exists(name.sourceString) && this.args.env.get(name.sourceString) instanceof Variable) {
                return this.args.env.get(name.sourceString).get()
            } else {
                if(this.args.env.get(name.sourceString) && this.args.env.get(name.sourceString) instanceof Variable) {
                    console.error(`No value found with name: ${name.sourceString}, ${this.args.env.get(name.sourceString)}`)
                } else {
                    console.error(`No value found with name: ${name.sourceString}, ${this.args.env.get(name.sourceString)}`)
                    return this.args.env.get(name.sourceString).value
                }
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
        var functionEnv = this.args.env.createChild()
        this.args.env.set(name.sourceString, new Func(
            persistant.sourceString ? true : false, 
            functionEnv,
            function(parameters: any[]) {
                parameters.forEach((param, index) => {
                    //console.log(ParameterList[index])
                    functionEnv.set(ParameterList[index].name, new Variable(
                        ParameterList[index].name,
                        ParameterList[index].mutable,
                        false,
                        param,
                        false,
                    ))
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
        ))
    },

    Array(_ob: ohm.Node, values: ohm.Node, _cb: ohm.Node) {
        return values.asIteration().children.map(c => c.eval(this.args.env))
    },

    ArrayAccess(_ot: ohm.Node, id: ohm.Node, _at: ohm.Node, index: ohm.Node, _ct: ohm.Node) {
        if(this.args.env.exists(id.sourceString)) {
            return this.args.env.get(id.sourceString).get()[index.eval(this.args.env)]
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
        if(this.args.env.exists(id.sourceString) && this.args.env.get(id.sourceString).isMutable()) {
            this.args.env.set(id.sourceString, "deleted by program")
        } else {
            throw new Error(`Can't delete if variable ${id.sourceString} doesn't exist!`)
        }
    },

    Exit(_ex: ohm.Node, uhoh: ohm.Node) {
        throw new ReturnSignal(uhoh.eval(this.args.env))
    },

    Exists(id: ohm.Node, _exists: ohm.Node) {
        return this.args.env.get(id.sourceString)
    },

    True(_val: ohm.Node) {
        return true
    },

    False(_val: ohm.Node) {
        return false
    },

    Equality_eq(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) == s2.eval(this.args.env)
    },

    Equality_deepEq(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) === s2.eval(this.args.env)
    },

    LogicalAnd_and(s1: ohm.Node, _and: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) && s2.eval(this.args.env)
    },

    LogicalOr_or(s1: ohm.Node, _or: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) || s2.eval(this.args.env)
    },
    
    LogicalXor_xor(s1: ohm.Node, _cc: ohm.Node, s2: ohm.Node) {
        return !(s1.eval(this.args.env) === s2.eval(this.args.env))
    },

    Comparison_greater(s1: ohm.Node, _arrow: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) > s2.eval(this.args.env)
    },

    Comparison_less(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) < s2.eval(this.args.env)
    },

    Comparison_greatereq(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) >= s2.eval(this.args.env)
    },

    Comparison_lesseq(s1: ohm.Node, _eq: ohm.Node, s2: ohm.Node) {
        return s1.eval(this.args.env) <= s2.eval(this.args.env)
    },

    Unary_not(_: ohm.Node, s: ohm.Node) {
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

    Unary_negate(_m: ohm.Node, value: ohm.Node) {
        return -value.eval(this.args.env)
    },

    //                                           hehe
    Postfix_increment(ident_untrimmed: ohm.Node, _pp: ohm.Node) {
        let ident = ident_untrimmed.sourceString.replace('&', '')
        if(this.args.env.exists(ident) && this.args.env.get(ident).isMutable()) {
            this.args.env.set(ident, this.args.env.get(ident) + 1)
        } else {
            throw new Error(this.args.env.exists(ident) ? 'Value is not mutable!': `No value found with name: ${ident}`)
        }
    },

    Query(_quer, _op, text, _cp) {
        const prompt = promptSync({ sigint: true });

        const val = prompt(text.eval(this.args.env));

        return val
    },

    Postfix_decrement(ident_untrimmed: ohm.Node, _pp: ohm.Node) {
        let ident = ident_untrimmed.sourceString.replace('&', '')
        if(this.args.env.exists(ident) && this.args.env.get(ident).isMutable()) {
            this.args.env.set(ident, this.args.env.get(ident) - 1)
        } else {
            throw new Error(this.args.env.exists(ident) ? 'Value is not mutable!': `No value found with name: ${ident}`)
        }
    },

    FnCall(_os: ohm.Node, name: ohm.Node, parameterList: ohm.Node, _cs: ohm.Node) {
        if(this.args.env.exists(name.sourceString)) {
            return this.args.env.get(name.sourceString).body(parameterList.eval(this.args.env))
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
        return listOfParams.asIteration().children.map(c => c.eval(this.args.env))
    },

    StatementParameterList(_op: ohm.Node, listOfParams: ohm.Node, _cp: ohm.Node) {
        return listOfParams.asIteration().children.map(c => c.eval(this.args.env))
    },

    _iter(...children) {
        return children.map((c: any) => c.eval(this.args.env))
    },

    ObjectPropertyAccess(_ob: ohm.Node, objectProperty: ohm.Node,_cb: ohm.Node) {
        return objectProperty.eval(this.args.env).val
    },

    ObjectProperty(Mid: ohm.Node, _d: ohm.Node, ids: ohm.Node) {
        if(this.args.env.get(Mid.sourceString).get() && typeof this.args.env.get(Mid.sourceString).get() == 'object') {
            let value = this.args.env.get(Mid.sourceString).get()
            let final;
            ids.asIteration().children.forEach((id, index) => {
                value = value[id.sourceString]
                if(typeof ids.asIteration().children[index + 1] == 'undefined') {
                    final = id.sourceString
                }
            })
            return {
                og: this.args.env.get(Mid.sourceString),
                val: value,
                final: final,
                Mid: Mid.sourceString,
                ids: ids,
            }
        } else {
            throw new Error(`Either can\'t find value ${Mid.sourceString}, or value is not an object`)
        }
    },

    MethodCall(_1: ohm.Node, objProp: ohm.Node, ParamList: ohm.Node, _2: ohm.Node) {
        let fn = objProp.eval(this.args.env)
        try {
            fn.val.env.env["self"] = fn.og // Add self to the method env
            fn.val.env.pointers["self"] = "self"
            fn.val.body(ParamList.eval(this.args.env))
        } catch(error: any) {
            if(error instanceof ReturnSignal) {
                //console.log(error.value)
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
        if(!this.args.env.exists(name.sourceString)) {
            this.args.env.set(name.sourceString, new Template(
                persistant.sourceString ? true : false,
                (parameters: parameterList) => {
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
            ))
        } else {
            throw new Error(`${name} already exists!`)
        }
    },

    Conversions_asfloat(_asfloat, _op, expr, _cp) {
        return parseFloat(expr.eval(this.args.env))
    },

    Conversions_asstring(_asstring, _op, expr, _cp) {
        return expr.eval(this.args.env).toString()
    },

    TemplateConstruction(id: ohm.Node, objectBody: ohm.Node) {
        if(this.args.env.exists(id.sourceString)) {
            //console.log(inspect(this.args.env.get(id.sourceString).construct(objectBody.eval(this.args.env))))
            return this.args.env.get(id.sourceString).construct(objectBody.eval(this.args.env))
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
        var methodEnv = this.args.env.createChild()
        let returned = {
            property: false,
            name: id.sourceString,
            env: methodEnv,
            body: function (parameters: any[]) {
                parameters.forEach((param, index) => {
                    //console.log(paramList[index])
                    this.env.set(paramList[index].name, new Variable(
                        paramList[index].name,
                        paramList[index].mutable,
                        false,
                        param,
                        false,
                    ))
                })

                try {
                    funcBody.eval(this.env)
                } catch(error: any) {
                    if(error instanceof ReturnSignal) {
                        //console.log(error.value)
                        throw new ReturnSignal(error.value)
                    } else {
                        console.error(error.stack)
                    }
                }
            }
        }
        return returned
    },                                    
}