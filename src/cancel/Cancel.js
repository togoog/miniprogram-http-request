
class Cancel {
  constructor(message) {
    this.message = message
    this.__CANCEL__ = true
  }

  toString() {
    return `Cancel： ${this.message ? this.message : ''}`
  }
}

export default Cancel