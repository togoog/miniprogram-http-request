function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var ø = Object.create(Object.prototype);
function toString(any) {
  return ø.toString.call(any).slice(8, -1);
}
function isObject(val) {
  return val !== null && _typeof(val) === 'object';
}
function isEmptyObject(val) {
  if (!isObject(val)) {
    return false;
  }

  for (var prop in val) {
    return false;
  }

  return true;
}
function isUndefined(val) {
  return typeof val === 'undefiend';
}
function isArrayBuffer(val) {
  return toString(val) === 'ArrayBuffer';
}
function isFormData(val) {
  return typeof FormData !== 'undefined' && val instanceof FormData;
}
function isPromise(val) {
  return val !== null && val !== undefined && typeof val.then === 'function' && typeof val["catch"] === 'function';
}

function normalizeHeaderName(headers, normalizeName) {
  for (var name in headers) {
    if (name !== normalizeName && name.toUpperCase() === normalizeName.toUpperCase()) {
      headers[normalizeName] = headers[name];
      delete headers[name];
    }
  }
}

var defaults = {
  //request url
  baseURL: '',
  //request data
  data: {},
  //timeout is not created
  timeout: 0,
  //request method 
  method: 'GET',
  //receive data type
  dataType: 'json',
  //response data type
  responseType: 'text',
  //enable cache 
  enableCache: false,
  //enable quic
  enableQuic: false,
  //enable Http2
  enableHttp2: false,
  //request headers
  header: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  //transform request data
  transformRequest: [function (data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (isFormData(data) || isArrayBuffer(data)) {
      return data;
    } // if(utils.isObject(data)){
    //   setContentTypeIfUnset(headers, 'application/json;charset=utf-8')
    //   return JSON.stringify(data)
    // }


    return data;
  }],
  //transform response data
  transformResponse: [function (data) {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (err) {
        /* ignore */
      }
    }

    return data;
  }],
  //response status
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

var InterceptorManager = /*#__PURE__*/function () {
  function InterceptorManager() {
    _classCallCheck(this, InterceptorManager);

    //interceptor array
    this.handlers = [];
  }

  _createClass(InterceptorManager, [{
    key: "use",
    value: function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    } //remove

  }, {
    key: "eject",
    value: function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    }
  }, {
    key: "foreach",
    value: function foreach(fn) {
      this.handlers.forEach(function (h) {
        if (h !== null) {
          fn(h);
        }
      });
    }
  }]);

  return InterceptorManager;
}();

var originConfig = ['url', 'data', 'header', 'timeout', 'method', 'dataType', 'responseType', 'enableHttp2', 'enableQuic', 'enableCache'];

function cleanRequestedConfig(config) {
  var retainConfig = {}; //retain config items

  originConfig.forEach(function (prop) {
    if (!isUndefined(config[prop])) {
      retainConfig[prop] = config[prop];
    }
  });
  return retainConfig;
}

function transformData(data, header, fns) {
  fns.forEach(function (fn) {
    data = fn(data, header);
  });
  return data;
}

function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
}

function isAbsoluteURL(url) {
  return /^([a-z][z-z\d\+\-\.]*:)?\/\//i.test(url);
}

var SymbolRequest = Symbol('request');
var SymbolHttpRequest = Symbol('httpRequest');
var SymbolWxRequest = Symbol('wxRequest');
var SymbolAliasMethod = Symbol('aliasMethod');

function throwIfCancellationRequest(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  return config;
}

var WxRequest = /*#__PURE__*/function () {
  function WxRequest(instanceConfig) {
    _classCallCheck(this, WxRequest);

    //merge instance config
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    }; //alias methods

    this[SymbolAliasMethod]();
  } //dispatch request


  _createClass(WxRequest, [{
    key: SymbolRequest,
    value: function value(config) {
      var _this = this;

      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = Object.assign(this.defaults, config);

      if (config.method) {
        config.method = config.method.toUpperCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toUpperCase();
      }

      if (config.baseURL && !isAbsoluteURL(config.url)) {
        config.url = combineURLs(config.baseURL, config.url);
      }

      var interceptorRequest = [];
      var interceptorResponse = [];
      var promise = Promise.resolve(config); //interceptor request

      this.interceptors.request.use(throwIfCancellationRequest, throwIfCancellationRequest);
      this.interceptors.request.foreach(function (interceptor) {
        interceptorRequest.push(interceptor.fulfilled, interceptor.rejected);
      }); //interceptor response

      this.interceptors.response.foreach(function (interceptor) {
        interceptorResponse.push(interceptor.fulfilled, interceptor.rejected);
      }); //inject interceptor request

      while (interceptorRequest.length) {
        promise = promise.then(interceptorRequest.shift(), interceptorRequest.shift());
      }

      promise = promise.then(function (defaults) {
        //inspect request interceptor callback
        if (isUndefined(defaults) || !isObject(defaults)) {
          throw new TypeError('Request interceptor configuration not returned. please inspect request interceptor callback!');
        } //interceptor callback {}


        if (isEmptyObject(defaults)) {
          throw new Error('The expected request parameters were not obtained. please inspect request interceptor callback!');
        }

        try {
          return _this[SymbolHttpRequest](defaults);
        } catch (e) {
          throw new Error(e);
        }
      }); //inject interceptor response

      while (interceptorResponse.length) {
        promise = promise.then(interceptorResponse.shift(), interceptorResponse.shift());
      }

      return promise;
    }
  }, {
    key: SymbolWxRequest,
    //request method
    value: function value(config) {
      return new Promise(function (resolve, reject) {
        config.success = function (fulfilled) {
          return resolve(fulfilled);
        };

        config.fail = function (rejected) {
          return reject(rejected);
        }; //wx origin function transform promise function


        var requested = wx.request(config);

        if (isPromise(requested)) {
          requested.then(resolve)["catch"](reject);
        }
      });
    }
  }, {
    key: SymbolHttpRequest,
    //http request
    value: function value(config) {
      config = Object.assign(config, {
        data: transformData(config.data, config.header, config.transformRequest || [])
      });

      var transformResponse = function transformResponse(resqonse) {
        //inspect resqonse interceptor callback
        if (isUndefined(resqonse) || !isObject(resqonse)) {
          throw new TypeError('Response interceptor configuration not returned. please inspect response interceptor callback!');
        } //interceptor callback {}


        if (isEmptyObject(resqonse)) {
          throw new Error('Incomplete response data. please inspect response interceptor callback!');
        }

        try {
          resqonse = Object.assign(resqonse, {
            //record config
            config: config,
            //transform response data
            data: transformData(resqonse.data, resqonse.header, config.transformResponse || [])
          });
          return config.validateStatus(resqonse.statusCode) ? resqonse : Promise.reject(resqonse);
        } catch (e) {
          throw new Error(e);
        }
      }; //clean the redundant config and send request, callback promise response


      return this[SymbolWxRequest](cleanRequestedConfig(config)).then(transformResponse, transformResponse);
    }
  }, {
    key: SymbolAliasMethod,
    //alias method
    value: function value() {
      var _this2 = this;

      ['DELETE', 'POST', 'CONNECT', 'TRACE', 'GET', 'HEAD', 'options'].forEach(function (method) {
        _this2[method.toLowerCase()] = function (url, config) {
          return _this2[SymbolRequest](url, Object.assign(config || {}, {
            method: method
          }));
        };
      });
    }
  }]);

  return WxRequest;
}();

var Cancel = /*#__PURE__*/function () {
  function Cancel(message) {
    _classCallCheck(this, Cancel);

    this.message = message;
    this.__CANCEL__ = true;
  }

  _createClass(Cancel, [{
    key: "toString",
    value: function toString() {
      return "Cancel\uFF1A ".concat(this.message ? this.message : '');
    }
  }]);

  return Cancel;
}();

var CancelToken = /*#__PURE__*/function () {
  function CancelToken(executor) {
    var _this = this;

    _classCallCheck(this, CancelToken);

    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function');
    }

    var resolvePromise;
    this.promise = new Promise(function (resolve) {
      resolvePromise = resolve;
    });
    executor(function (message) {
      if (_this.reason) {
        return;
      }

      _this.reason = new Cancel(message);
      resolvePromise(_this.reason);
    });
  }

  _createClass(CancelToken, [{
    key: "throwIfRequested",
    value: function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    }
  }]);

  return CancelToken;
}();

CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

var version = "1.0.0";

function extend(a, b, context) {
  var _loop = function _loop(key) {
    var fn = b[key];

    if (context && typeof fn === 'function') {
      a[key] = function wrap() {
        return fn.apply(context, Array.prototype.slice.call(arguments));
      };
    } else {
      a[key] = fn;
    }
  };

  for (var key in b) {
    _loop(key);
  }
}

function createInstance(defaultConfig) {
  var context = new WxRequest(defaultConfig);

  var instance = function wrap() {
    return WxRequest.prototype[SymbolRequest].apply(context, Array.prototype.slice.call(arguments));
  };

  extend(instance, WxRequest.prototype, context);
  extend(instance, context);
  return instance;
}
var WxRequest$1 = createInstance(defaults); //factory for creating new instances

WxRequest$1.create = function create(instanceConfig) {
  return createInstance(Object.assign(WxRequest$1.defaults, instanceConfig));
}; //cancel & cancelToken


WxRequest$1.Cancel = Cancel;
WxRequest$1.CancelToken = CancelToken;
WxRequest$1.isCancel = isCancel; //promise all

WxRequest$1.all = function all(promises) {
  return Promise.all(promises);
}; //version


WxRequest$1.version = version;

export default WxRequest$1;
