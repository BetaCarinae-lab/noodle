import { ReturnSignal } from "./etc.js";
import { inspect } from "util";

export const actionDictionary = {
    Program(statements, _semi) {
        return statements.children.map(s => s.eval(this.args.env));
    },

    Statement(stmt) {
        return stmt.eval(this.args.env);
    },

    Print(_print, _lp, expr, _rp) {
        const value = expr.eval(this.args.env);
        if(typeof value == 'object') {
            console.log('OUT: ' + JSON.stringify(value));
        } else {
            console.log('OUT: ' + value);
        }
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

    VarCreate(mut, pers, type, name, _eq, value) {
        if(typeof value.eval(this.args.env) == type.sourceString || (type.sourceString == 'array' && Array.isArray(value.eval(this.args.env)))) {
            this.args.env[name.sourceString] = {
                type: type.sourceString,
                value: value.eval(this.args.env),
                mutable: mut.sourceString ? true : false,
                persistant: pers.sourceString ? true : false,
            }
        } else {
            throw new Error(`Mismatched Types, Expected ${type.sourceString}, Got ${typeof value.eval(this.args.env)}`)
        }
    },

    VarAssign(name, _eq, value) {
        if(this.args.env[name.sourceString] && this.args.env[name.sourceString].mutable) {
            this.args.env[name.sourceString].value = value
        } else {
            throw new Error(this.args.env[name.sourceString] ? `That value is not mutable` : `No value found with name ${name.sourceString}`)
        }
    },

    VarGet(_ot, name, _ct) {
        if(this.args.env[name.sourceString]) {
             return this.args.env[name.sourceString].value
        } else {
            throw new Error(`No value found with name: ${name.sourceString}`)
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

    Fn(persistant, _fn, name, ParameterList, body) {
        ParameterList = ParameterList.eval(this.args.env);
        var functionEnv = this.args.env
        this.args.env[name.sourceString] = {
            persistant: persistant.sourceString ? true : false,
            body: (parameters) => {
                parameters.forEach((param, index) => {
                    functionEnv[ParameterList[index].replace('mut ', '')] = {
                        type: typeof param,
                        mutable: ParameterList[index].startsWith('mut '),
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

    Array(_ob, values, _cb) {
        return values.asIteration().children.map(c => c.eval(this.args.env))
    },

    ArrayAccess(_ot, id, _at, index, _ct) {
        if(this.args.env[id.sourceString]) {
            return this.args.env[id.sourceString].value[index.eval(this.args.env)]
        } else {
            throw new Error(`No Value Found with name: ${id.sourceString}`)
        }
    },

    Comment(_, _op, _txt, _cp) {
        return
    },

    Parameter(mut, ident) {
        return {
            mutable: mut.sourceString ? true : false,
            name: ident.sourceString, 
        }
    },

    End(_end) {
        // clean up
        console.log('Cleaning up!')
        Object.keys(this.args.env).forEach(key => {
            if(this.args.env[key].persistant) {
                console.log('Variable is persistant, ignoring')
            } else {
                console.log(`Deleting ${key}`)
                this.args.env[key] = null;
            }
        })
    },

    True(_val) {
        return true
    },

    False(_val) {
        return false
    },

    BooleanOperators_eq(s1, _eq, s2) {
        return s1.eval(this.args.env) == s2.eval(this.args.env)
    },

    BooleanOperators_deepEq(s1, _eq, s2) {
        return s1.eval(this.args.env) === s2.eval(this.args.env)
    },

    BooleanOperators_and(s1, _and, s2) {
        return s1.eval(this.args.env) && s2.eval(this.args.env)
    },

    BooleanOperators_or(s1, _or, s2) {
        return s1.eval(this.args.env) || s2.eval(this.args.env)
    },
    
    BooleanOperators_xor(s1, _cc, s2) {
        return !(s1.eval(this.args.env) === s2.eval(this.args.env))
    },

    BooleanOperators_greater(s1, _arrow, s2) {
        return s1.eval(this.args.env) > s2.eval(this.args.env)
    },

    BooleanOperators_less(s1, _eq, s2) {
        return s1.eval(this.args.env) < s2.eval(this.args.env)
    },

    BooleanOperators_greatereq(s1, _eq, s2) {
        return s1.eval(this.args.env) >= s2.eval(this.args.env)
    },

    BooleanOperators_lesseq(s1, _eq, s2) {
        return s1.eval(this.args.env) <= s2.eval(this.args.env)
    },

    BooleanOperators_not(_, s) {
        return !s.eval(this.args.env)
    },

    If(_if, _op, condition, _cp, body) {
        if(condition.eval(this.args.env)) {
            body.eval(this.args.env)
        }
    },

    //                     hehe
    Math_increment(ident_untrimmed, _pp) {
        let ident = ident_untrimmed.sourceString.replace('&', '')
        if(this.args.env[ident] && this.args.env[ident].mutable) {
            this.args.env[ident].value++
        } else {
            throw new Error(this.args.env[ident] ? 'Value is not mutable!': `No value found with name: ${ident}`)
        }
    },

    Math_decrement(ident_untrimmed, _pp) {
        let ident = ident_untrimmed.sourceString.replace('&', '')
        if(this.args.env[ident] && this.args.env[ident].mutable) {
            this.args.env[ident].value--
        } else {
            throw new Error(this.args.env[ident].mutable ? `No value found with name: ${ident}` : 'Value is not mutable!')
        }
    },

    FnCall(_os, name, parameterList, _cs) {
        if(this.args.env[name.sourceString]) {
            return this.args.env[name.sourceString].body(parameterList.eval(this.args.env))
        } else {
            throw new Error(`Cannot find function with name: ${name.sourceString}`)
        }
    },

    Return(_out, _op, value, _cp) {
        throw new ReturnSignal(value.eval(this.args.env))
    },

    FuncBody(_ob, body, _cb) {
        return body.eval(this.args.env)
    },

    ParameterList(_op, listOfParams, _cp) {
        return listOfParams.asIteration().children.map(c => c.sourceString)
    },

    StatementParameterList(_op, listOfParams, _cp) {
        return listOfParams.asIteration().children.map(c => c.eval(this.args.env))
    },

    _iter(...children) {
        return children.map(c => c.eval(this.args.env))
    },

    ObjectPropertyAccess(_ob, objectProperty,_cb) {
        return objectProperty.eval(this.args.env)
    },

    ObjectProperty(Mid, _d, ids) {
        if(this.args.env[Mid.sourceString].value && typeof this.args.env[Mid.sourceString].value == 'object') {
            let value = this.args.env[Mid.sourceString].value
            ids.asIteration().children.forEach((id) => {
                value = value[id.sourceString]
            })
            return value
        } else {
            throw new Error(`Either can\'t find value ${Mid.sourceString}, or value is not an object`)
        }
    },

    MethodCall(_1, objProp, ParamList, _2) {
        let fn = objProp.eval(this.args.env)
        try {
            fn.body(ParamList.eval(this.args.env))
        } catch(error) {
            if(error instanceof ReturnSignal) {
                return error.value
            } else {
                throw new Error(error.stack)
            }
        }
    },

    Template(_temp, name, body) {
        let constructorArgs = body.eval(this.args.env)
        if(!this.args.env[name.sourceString]) {
            this.args.env[name.sourceString] = (parameters) => {
                let returnedObject = {}
                parameters.values.forEach((value, index) => {
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
        } else {
            throw new Error(`${name} already exists!`)
        }
    },

    TemplateConstruction(id, objectBody) {
        if(this.args.env[id.sourceString]) {
            return this.args.env[id.sourceString](objectBody.eval(this.args.env))
        }
    },

    ObjectBody(_ob, name, _dingdong, statement, _, _cb) {
        return {
            values: statement.eval(this.args.env),
            refers: name.asIteration().children.map(c => c.sourceString)
        }
    },

    TemplateBody(_ob, properties, _cb) {
        let returnedObject = {}
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

    Property(mut, _prop, id, _is, type, _) {
        return {
            property: true,
            name: id.sourceString,
            mutable: mut.sourceString ? true : false,
            type: type.sourceString
        }
    },

    Method(_method, id, _is, paramList, funcBody) {
        paramList = paramList.eval(this.args.env);
        var methodEnv = this.args.env
        let returned = {
            property: false,
            name: id.sourceString,
            body: (parameters) => {
                parameters.forEach((param, index) => {
                    methodEnv[paramList[index].replace('mut ', '')] = {
                        type: typeof param,
                        mutable: paramList[index].startsWith('mut '),
                        value: param,
                    }
                })

                try {
                    funcBody.eval(methodEnv)
                } catch(error) {
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