mod eval;
mod ast;
mod context;

use context::Context;
use ast::Program;
use eval::refer;

fn main() {
    let mut ctx: Context = Context::new();

    let json = std::fs::read_to_string("./src/ast_json/ast.json").unwrap();
    
    let program: Program = Program(serde_json::from_str(&json).unwrap());

    for stmt in program.iter() {
        refer(stmt, &mut ctx)  
    };
}


