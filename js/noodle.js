const ohm = require('ohm-js');
const { readFileSync } = require('fs')
const g = ohm.grammar(readFileSync('./js/noodle.ohm', 'utf-8'))
const match = g.match(readFileSync(process.argv[2], 'utf-8'));
const semantics = g.createSemantics().addOperation('ast', require('./toast.js').actionDictionary)

if(match.succeeded()) {
    console.log(semantics(match).ast())
} else {
    console.log(match.message)
}


