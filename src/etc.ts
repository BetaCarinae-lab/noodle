import { inspect } from "node:util";
import * as os from 'os'
import * as fs from 'fs'
import { execSync } from "node:child_process";
import * as path from 'path'

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
            console.error(`Failed to get value from address: ${inspect(pointername)}`)
            console.error(inspect(this.pointers))
        }
    }

    new(pointername: string, value: any) {
        this.pointers[pointername] = pointername
        this.env[pointername] = value
    }

    reference(name: string, references: string) {
        this.pointers[name] = references
    }

    exists(name: string): boolean {
        return this.pointers[name] && this.env[this.pointers[name]]
    }

    createChild() {
        return this
    } 

    set(name: string, value: any) {
        if(this.pointers[name] && this.env[this.pointers[name]]) {
            let vari = this.env[this.pointers[name]]
            //console.log('----------------------')
            //console.log(`[SET]:\n(Setting ${name}, pointer value: ${this.pointers[name]}),\nVALUE: ${inspect(this.env[this.pointers[name]])}`)
            //console.log('----------------------')
            if(vari && vari.mutable) {
                this.env[this.pointers[name]] = value
            } else {
                console.error('Can\'t set value, either isn\'t mutable, or doesn\'t exist at all')
            }
        }
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

export function githubToRaw(
  githubUrl: string,
  options?: { branch?: string; filePath?: string }
): string {
  const url = new URL(githubUrl);

  // Already raw
  if (url.hostname === "raw.githubusercontent.com") {
    return githubUrl;
  }

  if (url.hostname !== "github.com") {
    throw new Error("Not a GitHub URL");
  }

  const parts = url.pathname.replace(/^\/|\.git$/g, "").split("/");

  const owner = parts[0];
  const repo = parts[1];

  if (!owner || !repo) {
    throw new Error("Invalid GitHub repository URL");
  }

  // Handle blob URLs
  if (parts[2] === "blob") {
    const branch = parts[3];
    const path = parts.slice(4).join("/");
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  }

  // Repo URL case
  const branch = options?.branch ?? "main";
  const filePath = options?.filePath ?? "";

  if (!filePath) {
    throw new Error(
      "File path required when converting a repository URL"
    );
  }

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

async function getGithubFile(
  githubUrl: string,
  filePath: string,
  branch = "main"
) {
  const rawUrl = githubToRaw(githubUrl, { branch, filePath });

console.log(rawUrl)

  const res = await fetch(rawUrl);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${rawUrl}`);
  }

  return await res.text();
}

export async function installPackage(repo: string) {
    try {
        console.log('Retrieving')
        const config = await getGithubFile(repo, 'ndconf.json')

        console.log(config)
    } catch(err: any) {
        console.error(err.stack)
    }


    /*
    const noodleDir = "./noodle_pkg"

    if (!fs.existsSync(noodleDir)) {
        fs.mkdirSync(noodleDir)
    }

    const conf = await fetch('https://raw.githubusercontent.com/user/repo/main/')

    const pkgName = repo.split("/")[1]
    const installPath = path.join(noodleDir, pkgName)
    const repoURL = repo

    console.log(`Installing ${repo}...`)

    execSync(`git clone ${repoURL} ${installPath}`, { stdio: "inherit" })

    console.log(`Installed to ${installPath}`)
    */
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
        if(value?.references) {
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
    value: {body: (parameters: any[]) => any}


    constructor(persistant: boolean, env: {[key: string]: any}, body: (parameters: any[]) => any) {
        this.persistant = persistant
        this.env = env
        this.value = {body: body}
    }

    call(params: any[]) {
        return this.value.body(params)
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