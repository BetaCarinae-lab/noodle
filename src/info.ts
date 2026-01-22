import { readFileSync } from 'fs';
import { resolve } from "path"
import { existsSync } from 'fs'


export const isPkg: boolean = typeof process.pkg == 'undefined'

export const VERSION = existsSync(resolve('./package.json')) ? JSON.parse(readFileSync(resolve('./package.json'), 'utf-8')).version : "NO.VERSION.FOUND"