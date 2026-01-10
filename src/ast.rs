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
    pub name: String,
    pub mutable: bool,
    pub persistant: bool,
    pub strict: bool,
    pub var_type: String,
    pub value: ExprTypes,
}

impl Variable {
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

    multiply {
        expr1: Box<Expr>,
        expr2: Box<Expr>,
    },

    subtract {
        expr1: Box<Expr>,
        expr2: Box<Expr>,
    },

    divide {
        expr1: Box<Expr>,
        expr2: Box<Expr>
    },

    var_get {
        id: String
    },
}