function normalizeHeaderName(headers, normalizeName) {
  for(let name in headers) {
    if(name !== normalizeName && name.toUpperCase() === normalizeName.toUpperCase()){
      headers[normalizeName] = headers[name]
      delete headers[name]
    }
  }
}

export default normalizeHeaderName