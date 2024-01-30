export class Settings {
  resultStoragePath: string = "./"
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
