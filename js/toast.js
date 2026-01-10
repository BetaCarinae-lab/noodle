const actionDictionary = {
    Program(statements, _semi) {
        return statements.children.map(c => c.ast())
    },

    Statement(stmt) {
        return stmt.ast();
    },

    Print(_print, _lp, expr, _rp) {
        return {
            type: "print",
            expr: expr.ast()
        }
    },

    Loop(_loop, expr, body) {
        return {
            type: "loop",
            expr: expr.ast()
        }
    },

    Math_parens(_op, expr, _cp) {
        return {
            type: "parens",
            expr: expr.ast()
        }
    },

    Math_add(expr1, _plus, expr2) {
        return {
            type: "add",
            expr1: expr1.ast(),
            expr2: expr2.ast()
        }
    },

    Math_minus(expr1, _minus, expr2) {
        return {
            type: "subtract",
            expr1: expr1.ast(),
            expr2: expr2.ast()
        }
    },

    Math_times(expr1, _times, expr2) {
        return {
            type: "multiply",
            expr1: expr1.ast(),
            expr2: expr2.ast()
        }
    },

    Math_divide(expr1, _divide, expr2) {
        return {
            type: "divide",
            expr1: expr1.ast(),
            expr2: expr2.ast()
        }
    },

    VarCreate(mut, pers, strict, type, name, _eq, value) {
        return {
            type: "var_create",
            mut: mut.sourceString ? true : false,
            pers: pers.sourceString ? true : false,
            strict: strict.sourceString ? true : false,
            var_type: type.sourceString,
            name: name.sourceString,
            value: value.ast()
        }
    },

    VarAssign(name, _eq, value) {
        return {
            type: "var_reassign",
            name: name.sourceString,
            value: value.ast()
        }
    },

    TryCatch(_try, trybody, _catch, _op, errorname, _cp, catchbody) {
        return {
            type: "try_catch",
            try_body: trybody.ast(),
            catch_errorname: errorname.sourceString ? errorname.sourceString : null,
            catch_body: catchbody.ast()
        }
    },

    Reference(_a, id) {
        return {
            type: "reference",
            references: id.sourceString
        }
    },

    RefResolve(_pipe, id, _pipe2) {
        return {
            type: "ref_resolve",
            id: id.sourceString,
        }
    },

    VarGet(_ot, name, _ct) {
        return {
            type: "var_get",
            id: name.sourceString
        }
    },

    ident(first, rest) {
        return {
            type: "id",
            text: first.sourceString + rest.sourceString
        }
    },

    Expr(e) {
        return e.ast();
    },

    number(digits) {
        return {
            type: "number",
            digits: digits.sourceString
        }
    },

    ExitValues(value) {
        return {
            type: "exit_value",
            value: value.sourceString
        }
    },

    string(_open, chars, _close) {
        return {
            type: "string",
            value: chars.sourceString
        }
    },

    Fn(persistant, _fn, name, ParameterList, body) {
        return {
            type: "function",
            persistant: persistant.sourceString ? true : false,
            name: name.sourceString,
            ParameterList: ParameterList.ast(),
            body: body.ast()
        }
    },

    Array(_ob, values, _cb) {
        return {
            type: "array",
            values: values.children.map(c => c.ast())
        }
    },

    ArrayAccess(_ot, id, _at, index, _ct) {
        return {
            type: "array_access",
            id: id.sourceString,
            index: index.ast()
        }
    },

    Comment(_, _op, _txt, _cp) {
        return {
            type: "comment"
        }
    },

    Parameter(mut, ident) {
        return {
            type: "parameter",
            mutable: mut.sourceString ? true : false,
            name: ident.sourceString, 
        }
    },

    Delete(_delete, id) {
        return {
            delete: "delete",
            id: id.sourceString
        }
    },

    Exit(_ex, uhoh) {
        return {
            type: "exit",
            value: uhoh.ast()
        }
    },

    Exists(id, _exists) {
        return {
            type: "exists",
            id: id.sourceString,
        }
    },

    True(_val) {
        return {
            type: "boolean",
            value: true,
        }
    },

    False(_val) {
        return {
            type: "boolean",
            value: false,
        }
    },

    BooleanOperators_eq(s1, _eq, s2) {
        return {
            type: "eq",
            s1: s1.ast(),
            s2: s2.ast()
        }
    },

    BooleanOperators_deepEq(s1, _eq, s2) {
        return {
            type: "deepEq",
            s1: s1.ast(),
            s2: s2.ast()
        }
    },

    BooleanOperators_and(s1, _and, s2) {
        return {
            type: "and",
            s1: s1.ast(),
            s2: s2.ast()
        }
    },

    BooleanOperators_or(s1, _or, s2) {
        return {
            type: "or",
            s1: s1.ast(),
            s2: s2.ast()
        }
    },
    
    BooleanOperators_xor(s1, _cc, s2) {
        return {
            type: "xor",
            s1: s1.ast(),
            s2: s2.ast()
        }
    },

    BooleanOperators_greater(s1, _arrow, s2) {
        return {
            type: "greater",
            s1: s1.ast(),
            s2: s2.ast()
        }
    },

    BooleanOperators_less(s1, _eq, s2) {
        return {
            type: "less",
            s1: s1.ast(),
            s2: s2.ast()
        }
    },

    BooleanOperators_greatereq(s1, _eq, s2) {
        return {
            type: "greatereq",
            s1: s1.ast(),
            s2: s2.ast()
        }
    },

    BooleanOperators_lesseq(s1, _eq, s2) {
        return {
            type: "lesseq",
            s1: s1.ast(),
            s2: s2.ast()
        }
    },

    BooleanOperators_not(_, s) {
        return {
            type: "not",
            s: s.ast()
        }
    },

    If(_if, _op, condition, _cp, body, _else, elseBody) {
        return {
            type: "if_else",
            condition: condition.ast(),
            if_body: body.ast(),
            usesElse: _else.sourceString ? true : false,
            else_body: elseBody.ast()
        }
    },

    Math_negate(_m, value) {
        return {
            type: "negate",
            value: value.ast()
        }
    },

    //                     hehe
    Math_increment(ident_untrimmed, _pp) {
        return {
            type: "increment",
            id: ident_untrimmed.sourceString.replace('&', ''),
        }
    },

    Math_decrement(ident_untrimmed, _pp) {
        return {
            type: "decrement",
            id: ident_untrimmed.sourceString.replace('&', '')
        }
    },

    FnCall(_os, name, parameterList, _cs) {
        return {
            type: "fn_call",
            name: name.sourceString,
            parameterList: parameterList.ast(),
        }
    },

    Return(_out, _op, value, _cp) {
        return {
            type: "return",
            value: value.ast()
        }
    },

    FuncBody(_ob, body, _cb) {
        return {
            type: "func_body",
            body: body.ast()
        }
    },

    ParameterList(_op, listOfParams, _cp) {
        return {
            type: "parameter_list",
            pList: listOfParams.asIteration().children.map(c => c.sourceString),
        }
    },

    StatementParameterList(_op, listOfParams, _cp) {
        return {
            type: "statement_parameter_list",
            pList: listOfParams.asIteration().children.map(c => c.ast())
        }
    },

    _iter(...children) {
        return {
            type: "iter",
            children: children.map(c => c.ast())
        }
    },

    ObjectPropertyAccess(_ob, objectProperty,_cb) {
        return {
            type: "object_access",
            object_property: objectProperty.ast()
        }
    },

    ObjectProperty(Mid, _d, ids) {
        return {
            type: "object_property",
            id: Mid.sourceString,
            ids: ids.ast()
        }
    },

    MethodCall(_1, objProp, ParamList, _2) {
        return {
            type: "method_call",
            obj: objProp.ast(),
            ParamList : ParamList.ast()
        }
    },

    Template(_temp, name, body) {
        return {
            type: "template",
            id: name.sourceString,
            body: body.ast()
        }
    },

    TemplateConstruction(id, objectBody) {
        return {
            type: "template_construction",
            id: id.sourceString,
            object_body: objectBody.ast()
        }
    },

    ObjectBody(_ob, name, _dingdong, statement, _, _cb) {
        return {
            type: "object_body",
            values: statement.eval(this.args.env),
            refers: name.asIteration().children.map(c => c.sourceString)
        }
    },

    TemplateBody(_ob, properties, _cb) {
        return {
            type: "template_body",
            properties: properties.children.map(c => c.ast())
        }
    },

    Property(mut, _prop, id, _is, type, _) {
        return {
            type: "property",
            property: true,
            name: id.sourceString,
            mutable: mut.sourceString ? true : false,
            type: type.sourceString
        }
    },

    Method(_method, id, _is, paramList, funcBody) {
        return {
            type: "method",
            id: id.sourceString,
            paramList: paramList.ast(),
            funcBody: funcBody.ast()
        }
    },                                    
}

module.exports = {
    actionDictionary
}