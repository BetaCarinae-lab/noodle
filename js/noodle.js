const ohm = require('ohm-js');
const { readFileSync, writeFileSync} = require('fs')
const g = ohm.grammar(readFileSync('./js/noodle.ohm', 'utf-8'))
const match = g.match(readFileSync(process.argv[2], 'utf-8'));
const semantics = g.createSemantics().addOperation('ast', require('./toast.js').actionDictionary)

if(match.succeeded()) {
    if(process.argv[3] == '--ast') {
        console.log(JSON.stringify(semantics(match).ast(), null, 2))
    } else {
        writeFileSync('./src/ast_json/ast.json', JSON.stringify(semantics(match).ast(), null, 2), 'utf-8')
    }
} else {
    console.log(match.message)
}


