use serde::Deserialize;
use crate::context::ExprTypes;
use crate::Context;
use crate::eval::eval_expr;

#[derive(Debug, Deserialize)]
pub struct Program(pub Vec<Stmt>);

impl Program {
    pub fn iter(&self) -> std::slice::Iter<'_, Stmt> {
        self.0.iter()
    }
}

pub struct Variable {
    #[allow(unused)]
    pub name: String,
    #[allow(unused)]
    pub mutable: bool,
    #[allow(unused)]
    pub persistant: bool,
    #[allow(unused)]
    pub strict: bool,
    #[allow(unused)]
    pub var_type: String,
    pub value: ExprTypes,
}

impl Variable {
    #[allow(unused)]
    pub fn new(name: String, mutable: bool, persistant: bool, strict: bool, var_type: String, value: ExprTypes) -> Self{
        Self {
            name: name,
            mutable: mutable,
            persistant: persistant,
            strict: strict,
            var_type: var_type,
            value: value,
        }
    }

    pub fn get(&self) -> ExprTypes {
        return self.value.clone()
    }


    #[allow(unused)]
    pub fn set(&mut self, set_to: Expr, ctx: &Context) {
        if(self.mutable) {
            self.value = eval_expr(&set_to, ctx)
        } else {
            panic!("Value isn't mutable!")
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum Stmt {
    #[serde(rename = "print")]
    Print { expr: Expr },
    #[allow(nonstandard_style)]
    var_create { mutable: bool, persistant: bool, strict: bool, var_type: String, name: String, expr: Expr },
}

#[derive(Debug, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum Expr {
    #[serde(rename = "add")]
    Add {
        expr1: Box<Expr>,
        expr2: Box<Expr>,
    },

    #[serde(rename = "number")]
    Number {
        digits: String,
    },

    #[serde(rename = "string")]
    String {
        value: String,
    },

    #[allow(nonstandard_style)]
    multiply {
        expr1: Box<Expr>,
        expr2: Box<Expr>,
    },

    #[allow(nonstandard_style)]
    subtract {
        expr1: Box<Expr>,
        expr2: Box<Expr>,
    },

    #[allow(nonstandard_style)]
    divide {
        expr1: Box<Expr>,
        expr2: Box<Expr>
    },

    #[allow(nonstandard_style)]
    var_get {
        id: String
    },
}