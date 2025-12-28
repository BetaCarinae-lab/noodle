import * as ohm from 'ohm-js';
import { readFileSync } from 'fs'

const grammar = ohm.grammar(readFileSync("noodle.ohm", "utf-8"))

