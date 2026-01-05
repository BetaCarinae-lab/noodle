import { fileURLToPath } from 'url'
import { dirname } from 'path'

export const VERSION = '0.9.7'
export const MWD = dirname(fileURLToPath(import.meta.url).replace('info.js', 'main.js'))