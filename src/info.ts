import { readFileSync } from 'fs';
import { resolve } from "path"
import { dirname } from  'path'
import { fileURLToPath } from 'url';
import { existsSync } from 'fs'

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const VERSION = existsSync(resolve('./package.json')) ? JSON.parse(readFileSync(resolve('./package.json'), 'utf-8')).version : "0.1.0"