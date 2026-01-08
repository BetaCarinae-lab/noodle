class ReturnSignal {
    constructor(value) {
        this.value = value
    }
}

class Enviroment {
    constructor(parent = null) { 
        this.parent = parent
        this.values = {}
    }

    get(name) {
        if(this.values[name]) {
            return this.values[name]
        } else {
            throw new Error(`Can't get ${name}, no variable with that name!`)
        }
    }

    store(name, value) {
        this.values[name] = value
    }

    remove(name) {
        this.values[name] = "deleted"
    }
}

module.exports = {
    ReturnSignal,
    Enviroment
}