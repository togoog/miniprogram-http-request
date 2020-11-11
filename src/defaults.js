import * as utils from './utils'
import normalizeHeaderNmae from './helpers/normalizeHeaderName'

export default {
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
    'Content-Type': 'application/x-www-form-urlencoded',
  },

  //transform request data
  transformRequest: [
    (data, headers) => {
      normalizeHeaderNmae(headers, 'Accept');
      normalizeHeaderNmae(headers, 'Content-Type');

      if(utils.isFormData(data)
        || utils.isArrayBuffer(data)
      ){
        return data
      }

      // if(utils.isObject(data)){
      //   setContentTypeIfUnset(headers, 'application/json;charset=utf-8')
      //   return JSON.stringify(data)
      // }

      return data
    }
  ],

  //transform response data
  transformResponse: [
    (data) => {
      if(typeof data === 'string') {
        try{
          data = JSON.parse(data)
        }catch(err){ /* ignore */ }
      }

      return data
    }
  ],

  //response status
  validateStatus: status => status >= 200 && status < 300,
}