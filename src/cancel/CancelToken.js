import Cancel from './Cancel'

class CancelToken {
  constructor(executor) {
    if(typeof executor !== 'function') {
      throw new TypeError('executor must be a function') 
    }

    let resolvePromise;
    this.promise = new Promise((resolve) => {
      resolvePromise = resolve;
    })

    executor((message) => {
      if(this.reason) {
        return
      }

      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }

  throwIfRequested() {
    if(this.reason) {
      throw this.reason
    }
  }
}

CancelToken.source = function source() {
  let cancel;
  let token = new CancelToken(function executor(c) {
    cancel = c
  })

  return {
    token,
    cancel
  }
}

export default CancelToken