const { readFileSync } = require('fs');
const { resolve } = require("path")
const { dirname } = require('path')
const { existsSync } = require('fs')

const MWD = dirname(__filename.replace('info.js', 'noodle.js'))
const VERSION = existsSync(resolve('./package.json')) ? JSON.parse(readFileSync(resolve('./package.json'), 'utf-8')).version : "0.1.0"

module.exports = {
    VERSION,
    MWD
}