import * as rl from 'raylib'
// graphics.js

const KEY_MAP: {[key: string]: any} = {
  "A": rl.KEY_A,
  "B": rl.KEY_B,
  "C": rl.KEY_C,
  "D": rl.KEY_D,
  "E": rl.KEY_E,
  "F": rl.KEY_F,
  "G": rl.KEY_G,
  "H": rl.KEY_H,
  "I": rl.KEY_I,
  "J": rl.KEY_J,
  "K": rl.KEY_K,
  "L": rl.KEY_L,
  "M": rl.KEY_M,
  "N": rl.KEY_N,
  "O": rl.KEY_O,
  "P": rl.KEY_P,
  "Q": rl.KEY_Q,
  "R": rl.KEY_R,
  "S": rl.KEY_S,
  "T": rl.KEY_T,
  "U": rl.KEY_U,
  "V": rl.KEY_V,
  "W": rl.KEY_W,
  "X": rl.KEY_X,
  "Y": rl.KEY_Y,
  "Z": rl.KEY_Z,

  "SPACE": rl.KEY_SPACE,
  "ENTER": rl.KEY_ENTER,
  "ESCAPE": rl.KEY_ESCAPE,

  "LEFT": rl.KEY_LEFT,
  "RIGHT": rl.KEY_RIGHT,
  "UP": rl.KEY_UP,
  "DOWN": rl.KEY_DOWN
};


export function initWindow(params: any[]) {
  const width = params[0];
  const height = params[1];
  const title = params[2];

  rl.InitWindow(width, height, title);
  rl.SetTargetFPS(60);
}

export function IS_KEY_DOWN(params: any[]) {
  const keyName = params[0];

  const keyCode = KEY_MAP[keyName];
  if (keyCode === undefined) {
    return false; // unknown key = not pressed
  }

  return rl.IsKeyDown(keyCode);
}

export function GET_MOUSE(_params: any[]) {
    return {
        x: rl.GetMouseX(),
        y: rl.GetMouseY(),
    }
}

export function delta(_p: any[]) {
  return rl.GetFrameTime()
}

export function RIGHT_MOUSE_BUTTON() {
  return rl.IsMouseButtonDown(rl.MOUSE_BUTTON_RIGHT)
}

export function LEFT_MOUSE_BUTTON() {
  return rl.IsMouseButtonDown(rl.MOUSE_BUTTON_LEFT)
}

export function windowShouldClose(_params: any[]) {
  return rl.WindowShouldClose();
}

export function beginDrawing(_params: any[]) {
  rl.BeginDrawing();
}

export function endDrawing(_params: any[]) {
  rl.EndDrawing();
}

export function clearBackground(params: any[]) {
  const r = params[0];
  const g = params[1];
  const b = params[2];
  const a = params[3] ?? 255;

  rl.ClearBackground({ r, g, b, a });
}

export function drawText(params: any[]) {
  const text = params[0];
  const x = params[1];
  const y = params[2];
  const size = params[3];
  const r = params[4];
  const g = params[5];
  const b = params[6];
  const a = params[7] ?? 255;

  rl.DrawText(text, x, y, size, { r, g, b, a });
}

export function drawRectangle(params: any[]) {
  const x = params[0];
  const y = params[1];
  const width = params[2];
  const height = params[3];
  const r = params[4];
  const g = params[5];
  const b = params[6];
  const a = params[7] ?? 255;

  rl.DrawRectangle(x, y, width, height, { r, g, b, a });
}

export function closeWindow(_params: any[]) {
  rl.CloseWindow();
}
