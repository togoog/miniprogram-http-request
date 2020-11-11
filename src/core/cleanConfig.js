import { isUndefined } from '../utils'

const originConfig = [
  'url',
  'data',
  'header',
  'timeout',
  'method',
  'dataType',
  'responseType',
  'enableHttp2',
  'enableQuic',
  'enableCache'
]

function cleanRequestedConfig(config) {
  const retainConfig = {};

  //retain config items
  originConfig.forEach(prop => {
    if(!isUndefined(config[prop])){
      retainConfig[prop] = config[prop]
    }
  });
  return retainConfig
}

export default cleanRequestedConfig