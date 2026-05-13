export class Logger {
  lineLog(msg: string): void {
    if (process.env.LOG || process.env.CI) console.log(msg);
  }

  jsonLog(json: object, label = 'LOG'): void {
    if (process.env.LOG || process.env.CI)
      console.log(`${label}:\n${JSON.stringify(json, null, 2)}`);
  }

  warn(msg: string): void {
    console.warn(`[WARN] ${msg}`);
  }
}
