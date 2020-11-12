import { isUndefined, isEmptyObject, isObject, isPromise } from '../utils'
import interceptorManager from './InterceptorManager'
import cleanConfig from './cleanConfig'
import transformData from './transformData'
import combineURLs from '../helpers/combineURLs'
import isAbsoluteURL from '../helpers/isAbsoluteURL'
import parseURLParams from '../helpers/parseURLParams'

export const SymbolRequest = Symbol('request')
export const SymbolHttpRequest = Symbol('httpRequest')
export const SymbolWxRequest = Symbol('wxRequest')
export const SymbolAliasMethod = Symbol('aliasMethod')

function throwIfCancellationRequest(config) {
  if(config.cancelToken){
    config.cancelToken.throwIfRequested()
  }
  return config
}

class WxRequest {
  constructor(instanceConfig) {
    //merge instance config
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new interceptorManager(),
      response: new interceptorManager()
    };

    //alias methods
    this[SymbolAliasMethod]()
  }

  //dispatch request
  [SymbolRequest](config) {
    if(typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
    }else{
      config = config || {}
    }

    config = Object.assign(this.defaults, config)

    if(config.method){
      config.method = config.method.toUpperCase()
    }else if(this.defaults.method){
      config.method = this.defaults.method.toUpperCase()
    } /* defaults GET */;
    
    if(config.baseURL && !isAbsoluteURL(config.url)){
      config.url = combineURLs(config.baseURL, config.url)
    }

    //parse url params
    const URLParams = parseURLParams(config.url);
    if(!isUndefined(URLParams.params)){
      config.url = URLParams.url
      config.data = Object.assign(config.data || {}, URLParams.params)
    }

    let interceptorRequest = [];
    let interceptorResponse = [];
    let promise = Promise.resolve(config);
    
    //interceptor request
    this.interceptors.request.use(throwIfCancellationRequest, throwIfCancellationRequest);
    this.interceptors.request.foreach(function(interceptor) {
      interceptorRequest.push(interceptor.fulfilled, interceptor.rejected)
    });

    //interceptor response
    this.interceptors.response.foreach(function(interceptor) {
      interceptorResponse.push(interceptor.fulfilled, interceptor.rejected)
    });

    //inject interceptor request
    while(interceptorRequest.length) {
      promise = promise.then(interceptorRequest.shift(), interceptorRequest.shift())
    };
    
    //http request
    promise = promise.then((defaults) => {
      //inspect request interceptor callback
      if(isUndefined(defaults) || !isObject(defaults)){
        throw new TypeError('Request interceptor configuration not returned. please inspect request interceptor callback!')
      }

      //interceptor callback {}
      if(isEmptyObject(defaults)){
        throw new Error('The expected request parameters were not obtained. please inspect request interceptor callback!')
      }
      
      try{
        return this[SymbolHttpRequest](defaults)
      }catch(e){
        throw new Error(e)
      }
    });

    //inject interceptor response
    while(interceptorResponse.length) {
      promise = promise.then(interceptorResponse.shift(), interceptorResponse.shift())
    }

    return promise;
  };

  //request method
  [SymbolWxRequest](config) {
    return new Promise((resolve, reject) => {
      config.success = fulfilled => resolve(fulfilled);
      config.fail = rejected => reject(rejected);
      
      //wx origin function transform promise function
      const requested = wx.request(config)

      if(isPromise(requested)){
        requested
        .then(resolve)
        .catch(reject)
      }
    })
  };

  //http request
  [SymbolHttpRequest](config) {
    config = Object.assign(config, {
      data: transformData(config.data, config.header, config.transformRequest || [])
    })

    const transformResponse = function(resqonse) {
      //inspect resqonse interceptor callback
      if(isUndefined(resqonse) || !isObject(resqonse)){
        throw new TypeError('Response interceptor configuration not returned. please inspect response interceptor callback!')
      }
      
      //interceptor callback {}
      if(isEmptyObject(resqonse)){
        throw new Error('Incomplete response data. please inspect response interceptor callback!')
      }

      try{
        resqonse = Object.assign(resqonse, {
          //record config
          config,
          //transform response data
          data: transformData(resqonse.data, resqonse.header, config.transformResponse || [])
        })
  
        return config.validateStatus(resqonse.statusCode) ? resqonse : Promise.reject(resqonse)
      }catch(e){
        throw new Error(e)
      }
    };

    //clean the redundant config and send request, callback promise response
    return this[SymbolWxRequest](cleanConfig(config)).then(transformResponse, transformResponse)
  };

  //alias method
  [SymbolAliasMethod]() {
    ['DELETE', 'POST', 'CONNECT', 'TRACE', 'GET', 'HEAD', 'options'].forEach(method => {
      this[method.toLowerCase()] = (url, config) => {
        return this[SymbolRequest](url, Object.assign(config || {}, {
          method
        }))
      }
    });
  }
}

export default WxRequest