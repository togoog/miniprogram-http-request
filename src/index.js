import defaults from './defaults'
import request, { SymbolRequest } from './core/request'
import cancel from './cancel/Cancel'
import cancelToken from './cancel/CancelToken'
import isCancel from './cancel/isCancel'
import { version } from '../package.json'

function extend(a, b, context) {
  for(let key in b){
    const fn = b[key];
    if(context && typeof fn === 'function'){
      a[key] = function wrap() {
        return fn.apply(context, [...arguments])
      }
    }else{
      a[key] = fn
    }
  }
};

function createInstance(defaultConfig) {
  const context = new request(defaultConfig)
  const instance = function wrap() {
    return request.prototype[SymbolRequest].apply(context, [...arguments])
  }

  extend(instance, request.prototype, context)
  extend(instance, context)

  return instance
};

const WxRequest = createInstance(defaults);

//factory for creating new instances
WxRequest.create = function create(instanceConfig) {
  return createInstance(Object.assign(WxRequest.defaults, instanceConfig))
};

//cancel & cancelToken
WxRequest.Cancel = cancel;
WxRequest.CancelToken = cancelToken;
WxRequest.isCancel = isCancel;

//promise all
WxRequest.all = function all(promises) {
  return Promise.all(promises)
};

//version
WxRequest.version = version;

export default WxRequest