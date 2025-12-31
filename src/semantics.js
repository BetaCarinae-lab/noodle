import { ReturnSignal } from "./etc.js";

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

    VarCreate(mut, type, name, _eq, value) {
        if(typeof value.eval(this.args.env) == type.sourceString || (type.sourceString == 'array' && Array.isArray(value.eval(this.args.env)))) {
            this.args.env[name.sourceString] = {
                type: type.sourceString,
                value: value.eval(this.args.env),
                mutable: mut.sourceString ? true : false,
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

    Fn(typeList, _fn, name, ParameterList, body) {
        ParameterList = ParameterList.eval(this.args.env);
        var functionEnv = this.args.env
        this.args.env[name.sourceString] = {
            properties: typeList.asIteration().children.map(c => c.sourceString),
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

    Parameter(mut, ident) {
        return {
            mutable: mut.sourceString ? true : false,
            name: ident.sourceString, 
        }
    },

    Math_increment(ident, _pp) {
        if(this.args.env[ident.sourceString] && this.args.env[ident.sourceString].mutable) {
            this.args.env[ident.sourceString].value++
        } else {
            throw new Error(this.args.env[ident.sourceString].mutable ? `No value found with name: ${ident.sourceString}` : 'Value is not mutable!')
        }
    },

    Math_decrement(ident, _pp) {
        if(this.args.env[ident.sourceString] && this.args.env[ident.sourceString].mutable) {
            this.args.env[ident.sourceString].value--
        } else {
            throw new Error(this.args.env[ident.sourceString].mutable ? `No value found with name: ${ident.sourceString}` : 'Value is not mutable!')
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
                console.log('id: ' + id.sourceString)
                console.log('Val: ' + JSON.stringify(value))
                value = value[id.sourceString]
            })
            return value
        }
    },

    MethodCall(_1, objProp, ParamList, _2) {
        let fn = objProp.eval(this.args.env)

        try {
            fn(ParamList.eval(this.args.env))
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
                    console.log(parameters.refers[index])
                    returnedObject[parameters.refers[index]] = value
                })

                console.log(returnedObject)

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
        console.log(JSON.stringify({
            values: statement.eval(this.args.env),
            refers: name.asIteration().children.map(c => c.sourceString)
        }, null, 2))
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
                console.log('Adding Property ' + property.name + ' to returnedObject')
                returnedObject[property.name] = property
            } else {
                console.log('Adding Method ' + property.name + ' to returnedObject')
                returnedObject[property.name] = property
            }
        })

        console.log('TEMPLATEBODY: ' + JSON.stringify(returnedObject, null, 2))

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
        return {
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
                    body.eval(methodEnv)
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
}