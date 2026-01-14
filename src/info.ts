import { readFileSync } from 'fs';
import { resolve } from "path"
import { dirname } from  'path'
import { existsSync } from 'fs'

export const MWD = dirname(process.execPath.replace('info.js', 'noodle.js'))
export const VERSION = existsSync(resolve('./package.json')) ? JSON.parse(readFileSync(resolve('./package.json'), 'utf-8')).version : "0.1.0"