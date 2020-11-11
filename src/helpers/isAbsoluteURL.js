function isAbsoluteURL(url) {
  return /^([a-z][z-z\d\+\-\.]*:)?\/\//i.test(url)
}

export default isAbsoluteURL