// this was made so TS wouldn't yell about how "pRoCeSs.PkG dOeSn'T eXisT"
// DON'T EDIT UNLESS YOU KNOW THAT IT WON'T FUCK SOMETHING UP
declare namespace NodeJS {
  interface Process {
    pkg?: unknown;
  }
}
