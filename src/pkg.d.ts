// this was made so TS wouldn't yell about how "pRoCeSs.PkG dOeSn'T eXisT"
declare namespace NodeJS {
  interface Process {
    pkg?: unknown;
  }
}
