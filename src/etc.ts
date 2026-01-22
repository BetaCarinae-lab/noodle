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
    env: {[key: string]: string}

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
}



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