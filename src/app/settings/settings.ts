export class Settings {
  resultStoragePath: string = "./"
  defaultColorList: string[] = [
    "#fd7f6f",
    "#7eb0d5",
    "#b2e061",
    "#bd7ebe",
    "#ffb55a",
    "#ffee65",
    "#beb9db",
    "#fdcce5",
    "#8bd3c7",
  ]
  constructor() {

  }

  toJSON(): string {
    const d: any = {}
    for (const key in this) {
      if (this[key] !== undefined) {
        d[key] = this[key]
      }
    }
    return JSON.stringify(d)
  }
  fromJSON(json: string) {
    const d: any = JSON.parse(json)
    for (const key in d) {
      // @ts-ignore
      if (this[key] !== undefined) {
        // @ts-ignore
        this[key] = d[key]
      }
    }
  }
}
