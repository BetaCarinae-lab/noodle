
use crate::ast::Variable;
use crate::ast::Expr;
use std::collections::HashMap;

pub struct Context {
    scopes: Vec<HashMap<String, Variable>>,
}

impl Context {
    pub fn new() -> Self {
        Self {
            scopes: vec![HashMap::new()],
        }
    }

    pub fn get(&self, name: &str) -> Option<&Variable> {
        self.scopes
            .iter()
            .rev()
            .find_map(|scope| scope.get(name))
    }

    pub fn set(&mut self, name: String, value: Variable) {
        self.scopes
            .last_mut()
            .unwrap()
            .insert(name, value);
    }

    pub fn copy_scope(&self) -> Context {
        return Context { scopes: self.scopes.clone() }
    }

    #[allow(unused)]
    pub fn push_scope(&mut self) {
        self.scopes.push(HashMap::new());
    }

    #[allow(unused)]
    pub fn pop_scope(&mut self) {
        self.scopes.pop();
    }
}

#[derive(Debug, Clone)]
pub enum ExprTypes {
    Number(i64),
    String(String),
    Expr(Expr),
}