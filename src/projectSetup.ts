import * as fs from 'fs'
import { join } from 'path'

export function setup(name: string) {
    let json = JSON.stringify({
        meta: {
            name: name,
            ver: '0.0.0',
            main: "main.nd",
            dependencies: [],
        },
        needs: []
    }, null, 2)
    console.log('Setting up your project')
    console.log('Creating Project Settings at ' + join(process.cwd(), "ndconf.json"))
    console.log("Make Sure to Configure your Main File in the settings!")
    fs.writeFileSync(join(process.cwd(), "ndconf.json"), json)   
    return 0
}