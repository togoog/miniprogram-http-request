function paramsSerializer(value) {
  return JSON.parse('{"' + value.replace(/=/g, '":"').replace(/&/g, ',') + '"}')
}

function parseURLParams(url) {
  let index = url.indexOf('?');
  let copy = url;

  let params;
  //url has params
  if(index > -1){
    url = url.substring(0, index);
    copy = copy.replace(url + '?', '');
    params = paramsSerializer(copy);
  }

  return {
    url,
    params
  }
}

export default parseURLParams