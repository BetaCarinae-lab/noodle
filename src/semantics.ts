import { Enviroment, Func, ReturnSignal, Template } from "./etc.js";
import * as ohm from "ohm-js"
import { Variable } from "./etc.js";    
import promptSync from 'prompt-sync';
import * as fs from 'fs'
// don't delete!, this is used for debugging!
import { inspect } from "node:util";;

export const actionDictionary: ohm.ActionDict<unknown> = {
    Program(statements: ohm.Node) {
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
        this.args.env.new(v.final, new Variable(v.final, mut.sourceString ? true : false, pers.sourceString ? true : false, v.value, strict.sourceString ? true : false))
    },

    Print(_print: ohm.Node, _lp: ohm.Node, expr: ohm.Node, _rp: ohm.Node) {
        const value = expr.eval(this.args.env);
        if(typeof value == 'object') {
            console.log('OUT: ' + inspect(value));
        } else {
            console.log('OUT: ' + value);
        }
    },

    PrintNoHeader(_print: ohm.Node, _lp: ohm.Node, expr: ohm.Node, _rp: ohm.Node) {
        const value = expr.eval(this.args.env);
        if(typeof value == 'object') {
            console.log(inspect(value));
        } else {
            console.log(value);
        }
    },

    Push(_push, _op, id, _, expr, _cp) {
        let originalarray = this.args.env.get(id.eval(this.args.env))
        originalarray.value.unshift(expr.eval(this.args.env))
        this.args.env.set(id.eval(this.args.env), originalarray)
    },

    Pop(_pop, _op, id, _cp) {
        let originalarray = this.args.env.get(id.eval(this.args.env))
        let value = originalarray.value.pop()
        this.args.env.set(id.eval(this.args.env), originalarray)
        return value
    },

    Loop(_loop: ohm.Node, expr: ohm.Node, body: ohm.Node) {
        let loopamount = expr.eval(this.args.env)
        for(let i = 0; i <= loopamount; i++) {
            let result = body.eval(this.args.env)

            if(result?.type == 'break') {
                break;
            }
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
            let result = body.eval(this.args.env)
            if(result?.type == 'break') {
                break;
            }
            if(result?.type == 'continue') {
                continue;
            }
        }
    },

    ArrayAssign(ident, _at, index, _is, expr) {
        let edited = this.args.env.get(ident.sourceString)
        edited.value[index.eval(this.args.env)] = expr.eval(this.args.env)
        this.args.env.set(ident.sourceString, edited)
    },

    VarCreate(mut: ohm.Node, pers: ohm.Node, strict: ohm.Node, type: ohm.Node, name: ohm.Node, _eq: ohm.Node, value: ohm.Node) {
        if(type.sourceString == "any" || typeof value.eval(this.args.env) == type.sourceString || (type.sourceString == 'array' && Array.isArray(value.eval(this.args.env)))) {
            this.args.env.new(name.sourceString, new Variable(name.eval(this.args.env), mut.eval(this.args.env), pers.eval(this.args.env), value.eval(this.args.env), strict.sourceString ? true : false))
        } else {
            throw new Error(`Mismatched Types, Expected ${type.sourceString}, Got ${typeof value.eval(this.args.env)}`)
        }
    },

    float(digit, _, digits) {
        return new Number(digit.sourceString + _.sourceString + digits.sourceString)
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
                this.args.env.new(name.eval(this.args.env), new Variable(
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

    ForEach(_foreach, _op, array_, _, indexname, _cp, body) {
        let loopEnv = this.args.env.createChild()
        loopEnv.new(indexname.sourceString, new Variable("i", true, false, "non_init", false))
        let array = array_.eval(this.args.env)
        for(let i = 0; i < array.length; i++) {
            loopEnv.set(indexname.sourceString, new Variable("i", true, false, i, false))
            body.eval(loopEnv)
        }
    },

    Fn(persistant: ohm.Node, _fn: ohm.Node, name: ohm.Node, ParameterList: ohm.Node, body: ohm.Node) {
        ParameterList = ParameterList.eval(this.args.env);
        var functionEnv = this.args.env.createChild()
        this.args.env.new(name.sourceString, new Func(
            persistant.sourceString ? true : false, 
            functionEnv,
            (parameters: any[]) => {
                parameters.forEach((param, index) => {
                    //console.log(ParameterList[index])
                    functionEnv.new(ParameterList[index].name, new Variable(
                        ParameterList[index].name,
                        ParameterList[index].mutable,
                        false,
                        param,
                        false,
                    ))
                })

                try {
                    //console.log('POINTERS: \n', functionEnv.pointers)
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
        if(this.args.env.exists(id.sourceString) || typeof id.eval(this.args.env) !== 'string') {
            //console.log(id.eval(this.args.env))
            let evaled = id.eval(this.args.env)
            if(typeof evaled == 'string') {
                //console.log('string')
                return this.args.env.get(evaled).value[index.eval(this.args.env)]
            } else {
                return id.eval(this.args.env)[index.eval(this.args.env)]
            }
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
            this.args.env.new(id.sourceString, "deleted by program")
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

    Break(_) {
        return {type: "break"}
    },

    Continue(_) {
        return {type: "continue"}
    },

    If(_if: ohm.Node, _op: ohm.Node, condition: ohm.Node, _cp: ohm.Node, body: ohm.Node, elsepart: ohm.Node) {
        const condval = condition.eval(this.args.env)
        
        if(condval) {
            return body.eval(this.args.env)
        }

        // only evaluate if it exists
        if(elsepart.children.length > 0) {
            return elsepart.eval(this.args.env)
        }


        return null;
    },

    ElsePart_elseIf(_e, nestedif) {
        return nestedif.eval(this.args.env)
    },

    ElsePart_else(_else, body) {
        return body.eval(this.args.env)
    },

    Unary_negate(_m: ohm.Node, value: ohm.Node) {
        return -value.eval(this.args.env)
    },

    //                                           hehe
    Postfix_increment(ident_untrimmed: ohm.Node, _pp: ohm.Node) {
        let ident = ident_untrimmed.sourceString.replace('&', '')
        if(this.args.env.exists(ident) && this.args.env.get(ident).isMutable()) {
            this.args.env.new(ident, this.args.env.get(ident) + 1)
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
            this.args.env.new(ident, this.args.env.get(ident) - 1)
        } else {
            throw new Error(this.args.env.exists(ident) ? 'Value is not mutable!': `No value found with name: ${ident}`)
        }
    },

    FnCall(_os: ohm.Node, name: ohm.Node, parameterList: ohm.Node, _cs: ohm.Node) {
        if(this.args.env.exists(name.sourceString)) {
            return this.args.env.get(name.sourceString).value.body(parameterList.eval(this.args.env))
        } else {
            throw new Error(`Cannot find function with name: ${name.sourceString}`)
        }
    },

    Object(_ob, propList_, _cb) {
        let propList = propList_.asIteration().children.map(c => c.eval(this.args.env))
        let obj: {[key: string]: any} = {};
        for(let i = 0; i <= propList.length; i++) {
            let prop = propList[i]
            if(!prop) {
                break
            }
            console.log('TEST: ' + inspect(prop))
            obj[prop.id] = prop.val
        }

        console.log('OBJ: ' + inspect(obj))

        return obj
    },

    ObjectPropertyDecl(_prop, id, _is, val, _) {
        return {
            id: id.eval(this.args.env),
            val: val.eval(this.args.env)
        }
    },

    AnonFunc(params_, _arrow, body) {
        let params = params_.eval(this.args.env)
        let functionEnv = this.args.env.createChild()
        return {body: (parameters: any[]) => {
            parameters.forEach((param, index) => {
                //console.log(ParameterList[index])
                functionEnv.new(params[index].name, new Variable(
                    params[index].name,
                    params[index].mutable,
                    false,
                    param,
                    false,
                ))
            })

            try {
                //console.log('POINTERS: \n', functionEnv.pointers)
                body.eval(functionEnv)
            } catch(error: any) {
                if(error instanceof ReturnSignal) {
                    return error.value
                } else {
                    console.error(error.stack)
                }
            }
        }}
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
        if(typeof Mid.eval(this.args.env) == 'string') {
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
        } else {
            let value = Mid.eval(this.args.env)
            let final;
            ids.asIteration().children.forEach((id, index) => {
                value = value[id.sourceString]
                if(typeof ids.asIteration().children[index + 1] == 'undefined') {
                    final = id.sourceString
                }
            })
            return {
                og: Mid.eval(this.args.env),
                val: value,
                final: final,
                Mid: Mid.sourceString,
                ids: ids,
            }
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
            this.args.env.new(name.sourceString, new Template(
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