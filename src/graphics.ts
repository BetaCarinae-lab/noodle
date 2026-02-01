import * as r from 'raylib'
import { Func, Template } from './etc'

type parameterList = {
    values: any[],
    refers: string[]
}

type graphics_handle = {
    shouldClose: () => boolean
    clear: (plist: any[]) => void
    begin: () => void
    stop: () => void
}

type drawing_handle = {
    drawCircle: (params: any[]) => void
}

let isWindowOpen = false

// every template needs a 
// persistant: bool
// construct: function
export const GRAPHICS_API_BINDINGS = {
    window: new Func(true, {}, (params) => {
        if (params[0] === "init") {
            r.InitWindow(params[1], params[2], params[3])
            isWindowOpen = true
        } else if (params[0] === "close") {
            r.CloseWindow()
            isWindowOpen = false
        } else if (params[0] === "draw") {
            if (!isWindowOpen) throw new Error("Window not initialized")
            r.BeginDrawing()
            r.ClearBackground(r.RAYWHITE)
            // optionally pass drawing commands from your language here
            if(params[1] == 'circle') {
                r.DrawCircle(params[2], params[3], params[4], params[5])
            }
            r.EndDrawing()
        } else {
            throw new Error(`Unknown window init type: ${params[0]}`)
        }
    }),
    graphics_handle: new Template(true, (plist: parameterList) => {
        let handle: graphics_handle = {
            shouldClose: r.WindowShouldClose,
            clear: (params) => {
                r.ClearBackground(params[0])
            },
            begin: r.BeginDrawing,
            stop: r.EndDrawing,
        }
        return handle
    }),
    draw: new Template(true, (plist: parameterList) => {
        let handle: drawing_handle = {
            drawCircle: (params) => {
                r.DrawCircle(params[0], params[1], params[2], params[3])
            },
        }
        return handle
    }),
    color: new Func(true, {}, (params) => {
        return { r: params[0], g: params[1], b: params[2], a: params[3]}
    })

}