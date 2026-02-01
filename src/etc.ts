import { inspect } from "node:util";

export type env = {
    pointers: {
        [key: string]: string
    },
    env: {
        [key: string]: any
    }
}

export class ReturnSignal {
    value: any;

    constructor(value: any) {
        this.value = value
    }
}



export class Enviroment {
    pointers: {[key: string]: string}
    env: {[key: string]: any}

    constructor() {
        this.pointers = {}
        this.env = {}
    }

    get(pointername: string) {
        if(this.pointers[pointername] && this.env[this.pointers[pointername]]) {
            return this.env[this.pointers[pointername]]
        } else {
            console.error(`Failed to get value from address: ${pointername}`)
        }
    }

    set(pointername: string, value: any) {
        this.pointers[pointername] = pointername
        this.env[pointername] = value
    }

    reference(name: string, references: string) {
        this.pointers[name] = references
    }

    varset(pname: string, value: any) {
        if(this.pointers[pname] && this.env[this.pointers[pname]] && this.env[this.pointers[pname]] instanceof Variable) {
            //console.log(`${inspect(this.env[this.pointers[pname]])}`)
            try {
                //console.log(typeof this.env[this.pointers.pname].set)
                this.env[this.pointers.pname].set(value)
            } catch(err) {
                console.error('Uhoh, Variable doesn\'t inherit [set]!')
                const variable = this.env[this.pointers.pname]
                if(variable.mutable) {
                    if(variable.strict) {
                        if(variable.type == getType(value)) {
                            //console.log(`${inspect(this.env[this.pointers.pname])}`)
                            this.env[this.pointers.pname].value = value
                        } else {
                            console.error('Cannot change variables value, is strict, and new value isn\' of correct type!')
                            return null
                        }
                    } else {
                        variable.value = value
                    }
                } else {
                    console.error('Cannot change variables value, isn\' mutable!')
                    return null;
                }
            }
        } else {
            console.error(`Couldn\'t find ${pname}, ${JSON.stringify(this.env[this.pointers.pname])} or variable doesn't inherit [set]`)
        }
    }

    exists(name: string) {
        return this.pointers[name] && this.env[this.pointers[name]]
    }

    createChild() {
        return this
    } 
    
    /**
     * 
     * @param selfPriority - Do i override?
     * @param newenv - Env to merge with
     */
    merge(selfPriority: any, newenv: Enviroment) {
        if(selfPriority) {
            this.env = {... newenv, ...this.env}
        } else {
            this.env = {...this.env, ...newenv}
        }
    }

    cleanUp() {
        // clean up
        //console.log('Cleaning up!')
        Object.keys(this.pointers).forEach(key => {
            if(this.env[this.pointers[key]] && this.env[this.pointers[key]].persistant) {
                //console.log('Variable is persistant, ignoring')
            } else {
                this.env[this.pointers[key]] = null;
            }
        })
    }
}

export function getType(value: any) {
    if(typeof value == "undefined") {
        return "undefined"
    } else if(typeof value == "string") {
        return "string"
    } else if(typeof value == "boolean") {
        return "bool"
    } else if(typeof value == "number") {
        return "number"
    } else if(typeof value == "object") {
        if(value.references) {
            return "reference"
        } else if(Array.isArray(value)) {
            return "array"
        } else {
            return "object"
        }
    } else {
        return "no_type"
    }
}

export class Func {
    persistant: boolean
    env: {[key: string]: any}
    body: (parameters: any[]) => any


    constructor(persistant: boolean, env: {[key: string]: any}, body: (parameters: any[]) => any) {
        this.persistant = persistant
        this.env = env
        this.body = body
    }

    call(params: any[]) {
        return this.body(params)
    }

    set() {
        console.error('This shouldn\' happen 3:')
    }
}

type plist = {
    refers: string[],
    values: any[]
}

export class Template {
    persistant: boolean
    construct: (paramlist: plist) => { [key: string]: any }

    constructor(persistant: boolean, construct: (paramList: plist) => { [key: string]: any }) {
        this.persistant = persistant
        this.construct = construct
    }

    tree() {
        console.log(inspect(this))
    }
} 

'\a\b\c\d\e\f\g\h\i\j\k\l\m\n\o\p\q\r\s\t\v\w\y\z'
'\!\@\#\$\%\^\&\*\(\)\-\=\\\}\{\[\]' 
// why can every letter except u and x be used as an escape char?
// i'm getting sidetracked, back to work
// but rq, what does this look like printed?    
// let allescapechars = '\a\b\c\d\e\f\g\h\i\j\k\l\m\n\o\p\q\r\s\t\v\w\y\z'
//console.log(allescapechars)
/*
cde
   ghijklm
spq
        wyz
*/
// huh, anyway

export class Variable {
    name: string
    mutable: boolean
    persistant: boolean
    value: any
    strict: boolean
    type: string


    constructor(name: string, mutable: boolean, persistant: boolean, value: any, strict: boolean) {
        this.name = name
        this.mutable = mutable
        this.persistant = persistant
        this.strict = strict
        this.type = getType(value)
        this.value = value
    }

    get() {
        return this.value
    }

    set(value: any) {
        if(this.isMutable()) {
            if(this.isStrict()) {
                if(this.type == getType(value)) {
                    this.value = value
                } else {
                    console.error('Cannot change variables value, is strict, and new value isn\' of correct type!')
                    return null
                }
            } else {
                this.value = value
            }
        } else {
            console.error('Cannot change variables value, isn\' mutable!')
            return null;
        }
    }

    isMutable() {
        return this.mutable
    }

    isPersistant() {
        return this.persistant
    }

    isStrict() {
        return this.strict
    }
}