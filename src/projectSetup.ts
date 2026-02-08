import * as fs from 'fs'
import { join } from 'path'

export function setup(name: string) {
    let json = JSON.stringify({
        meta: {
            name: name,
            ver: '0.0.0'
        },
        needs: []
    }, null, 2)
    console.log('Setting up your project')
    console.log('Creating Project Settings at ' + join(process.cwd(), "ndconf.json"))
    fs.writeFileSync(join(process.cwd(), "ndconf.json"), json)   

    return 0
}