use crate::context::Context;
use crate::ast::Stmt;
use crate::ast::Variable;
use crate::context::ExprTypes;
use crate::ast::Expr;

pub fn refer(stmt: &Stmt, ctx: &mut Context) {
    match stmt {
        Stmt::Print { expr } => {
            let value = eval_expr(expr, ctx);
            match value {
                ExprTypes::Number(val) => {
                    println!("OUT: {:?}", val)
                }
                ExprTypes::Expr(val) => {
                    println!("OUT: {:?}", val)
                }
                ExprTypes::String(val) => {
                    println!("OUT: {:?}", val)
                }

            }
        },

        Stmt::var_create { mutable, persistant, strict, var_type, name, expr } => {
            ctx.set(
                name.clone(), 
                Variable { 
                    name: name.clone(), 
                    mutable: *mutable, 
                    persistant: *persistant, 
                    strict: *strict, 
                    var_type: var_type.clone(), 
                    value: eval_expr(&expr, ctx) 
                }
            );
        },

        Stmt::Function { persistant, name, parameter_list, body } => {
            println!("{} {} {:?} {:?}", persistant, name, parameter_list, body)
        }
    }
}



pub fn eval_expr(expr: &Expr, ctx: &Context) -> ExprTypes {
    match expr {
        Expr::Number { digits } => {
            ExprTypes::Number(digits.parse::<i64>().unwrap())
        }

        Expr::Add { expr1, expr2 } => {
            ExprTypes::Number(handle_number(eval_expr(expr1, ctx), ctx) + handle_number(eval_expr(expr2, ctx), ctx))
        },

        Expr::subtract { expr1, expr2 } => {
            ExprTypes::Number(handle_number(eval_expr(expr1, ctx), ctx) + handle_number(eval_expr(expr2, ctx), ctx))
        },

        Expr::divide { expr1, expr2 } => {
            ExprTypes::Number(handle_number(eval_expr(expr1, ctx), ctx) + handle_number(eval_expr(expr2, ctx), ctx))
        },

        Expr::multiply { expr1, expr2 } => {
            ExprTypes::Number(handle_number(eval_expr(expr1, ctx), ctx) + handle_number(eval_expr(expr2, ctx), ctx))
        },

        Expr::var_get { id } => {
            match ctx.get(id) {
                Some(var) => {
                    return var.get()
                }
                None => {return ExprTypes::Expr(Expr::Number { digits: "NULL".to_string() });}
            }
        },

        Expr::String { value } => {
            ExprTypes::String(value.clone())
        }
    }
}


pub fn handle_number(val: ExprTypes, ctx: &Context) -> i64 {
    match val {
        ExprTypes::Number(value) => {
            return value
        }
        ExprTypes::Expr(value) => {
            match eval_expr(&value, ctx) {
                ExprTypes::Number(value) => {
                    return value
                }
                ExprTypes::Expr(_value) => {
                    println!("Unhandled Error at eval.rs 65, attempted to handle expr number, failed miserably, im sorry :(");
                    return 0
                }
                ExprTypes::String(val) => {
                    return -60
                }
            }
        }
        ExprTypes::String(value) => {
            return -60
        }
    }
}