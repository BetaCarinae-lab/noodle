interface nd_variable {
    strict: boolean,
    mutable: boolean,
    value: any,
    persistant: boolean,
    type: boolean,
    get(): any
    set(): void
    isMutable(): boolean,
    isPersistant(): boolean,
    isStrict(): boolean,
}

type pList = {
    values: any[],
    refers: any[],
}

interface nd_function {
    persistant: boolean,
    body: (params: any[]) => void,
}

interface nd_template {
    persistant: boolean,
    construct: (parameters: pList) => {
        [key: string]: any
    }
}

