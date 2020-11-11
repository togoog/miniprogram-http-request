class InterceptorManager {
  constructor() {
    //interceptor array
    this.handlers = []
  }

  use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected
    })

    return this.handlers.length - 1
  }

  //remove
  eject(id) {
    if(this.handlers[id]){
      this.handlers[id] = null
    }
  }

  foreach(fn) {
    this.handlers.forEach(h => {
      if(h !== null){
        fn(h)
      }
    })
  }
}

export default InterceptorManager