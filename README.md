# miniprogram-http-request

> 插件文档可以参考 **[axios](http://www.axios-js.com/zh-cn/docs)**，小程序`wx-request`请求方法与浏览器`XMLHttpRequest`不同，文档部分内容会有差异。

## 插件介绍

该插件模仿axios创建，基于 `promise` 封装 **[wx-request](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)** 请求方法，支持自定义请求的配置、拦截请求和响应、转换请求和响应数据、自动转换 JSON 数据。

## 安装

```
npm i miniprogram-http-request -S
```

## 案例

引入插件

```javascript
import httpRequest  from 'miniprogram-http-request'
```

`GET` 请求
```javascript
httpRequest.get('/user?ID=12345')
  .then((res) => {
    console.log(res)
  })
  .catch((error) => {
    console.log(error)
  })
```

`POST` 请求
```javascript
httpRequest.post('/user', {
  data: {
    userid: 123,
    name: 'sanwi'
  }
})
  .then((res) => {
    console.log(res)
  })
  .catch((error) => {
    console.log(error)
  })
```

合并请求
```javascript
httpRequest.all([
  httpRequest.get('/user?ID=12345'),
  httpRequest.post('/user', {
    data: {
      userid: 123,
      name: 'sanwi'
    }
  })
])
  .then((res) => {
    console.log(res)
  })
  .catch((error) => {
    console.log(error)
  })
```

## httpRequest - API

可以通过向 `httpRequest` 传递相关配置来创建请求

### httptRquest(config)

```javascript
//POST 请求
httptRquest({
	method: 'post',
	url: '/user',
	data: {
    userid: 123,
    name: 'sanwi'
	}
})
```

### httptRquest(url[, config])
```javascript
//GET 请求（默认的方法）
httptRquest('/user?ID=12345')
```

## 请求别名方法

为方便起见，为所有支持的请求方法提供了别名

### httptRquest.options(url[, config])
### httptRquest.get(url[, config])
### httptRquest.head(url[, config])
### httptRquest.post(url[, config])
### httptRquest.put(url[, config])
### httptRquest.delete(url[, config])
### httptRquest.trace(url[, config])
### httptRquest.connect(url[, config])

## 请求配置
这些是创建请求时可以用的配置选项。只有 `url` 是必需的。如果没有指定 `method`，请求将默认使用 `get` 方法。

```javascript
{
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
    (data) => {
      normalizeHeaderNmae(headers, 'Accept');
      normalizeHeaderNmae(headers, 'Content-Type');

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
```

## 响应结构
某个请求的响应包含以下信息：

```javascript
{
  // `cookies` 由服务器提供的响应
  cookies: [],

  // `data` 由服务器提供的响应
  data: {},

  // `statusCode` 来自服务器响应的 HTTP 状态码
  statusCode: 200,

  // `errMsg` 来自服务器响应的 HTTP 状态信息
  errMsg: 'request:ok',

  // `header` 服务器响应的头
  header: {},

  // `config` 是为请求提供的配置信息
  config: {},
}
```

使用 `then`时，你将接收下面这样的响应：

```javascript
httpRequest.get('/user?ID=12345')
  .then((res) => {
    console.log(response.cookies);
    console.log(response.data);
    console.log(response.statusCode);
    console.log(response.errMsg);
    console.log(response.header);
    console.log(response.config);
  })
```

## 拦截器

在请求或响应被 `then` 或 `catch` 处理前拦截它们。

> 注意：拦截器必须返回 **return**

```javascript
// 添加请求拦截器
httpRequest.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
httpRequest.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response;
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error);
});
```

如果你想在稍后移除拦截器，可以这样：

```javascript
const myInterceptor = httpRequest.interceptors.request.use(function () {/*...*/});
httpRequest.interceptors.request.eject(myInterceptor);
```

可以为自定义 `httpRequest` 实例添加拦截器

```javascript
const instance = httpRequest.create();
instance.interceptors.request.use(function () {/*...*/});
```

## 错误处理

```javascript
httpRequest.get('/user/12345')
  .catch(function (error) {
    //Something happened in setting up the request that triggered an Error
    console.log('Error', error.errMsg);
    console.log(error.config);
  });
```

使用 `validateStatus` 配置选择定义一个自定义 HTTP 状态码的错误范围。

```javascript
httpRequest.get('/user/12345', {
  validateStatus: function (status) {
    return status < 500; // Reject only if the status code is greater than or equal to 500
  }
})
```

## 取消请求

使用cancel token取消请求  

可以使用 `CancelToken.source` 工厂方法创建 cancel token，像这样：

```javascript
const CancelToken = httpRequest.CancelToken;
const source = CancelToken.source();

httpRequest.get('/user/12345', {
  cancelToken: source.token
})
.catch(function(thrown) {
  if (axios.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
     // 处理错误
  }
});

axios.post('/user/12345', {
  name: 'new name'
}, {
  cancelToken: source.token
})

// 取消请求（message 参数是可选的）
source.cancel('Operation canceled by the user.');
```

还可以通过传递一个 executor 函数到 `CancelToken` 的构造函数来创建 cancel token：

```javascript
const CancelToken = httpRequest.CancelToken;
let cancel;

axios.get('/user/12345', {
  cancelToken: new CancelToken(function executor(c) {
    // executor 函数接收一个 cancel 函数作为参数
    cancel = c;
  })
});

// cancel the request
cancel();
```

> 注意: 可以使用同一个 cancel token 取消多个请求