export class Settings {
  resultStoragePath: string = "./"
  APIKey: string = ""
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
  curtainBackendUrl: string = "https://celsus.muttsu.xyz"

  privateKey: string = ""
  publicKey: string = ""
  useSystemR: boolean = false
  RPath: string = ""
  useSystemPython: boolean = false
  pythonPath: string = ""

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
