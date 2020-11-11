
const ø = Object.create(Object.prototype)

export function toString(any) {
  return ø.toString.call(any).slice(8, -1)
}

export function isString(val) {
  return typeof val === 'string'
}

export function isNumber(val) {
  return typeof val === 'number'
}

export function isObject(val) {
  return val !== null && typeof val === 'object'
}

export function isEmptyObject(val) {
  if(!isObject(val)){
    return false
  }

  for(let prop in val) {
    return false
  }

  return true
}

export function isArray(val) {
  return toString(val) === 'Array'
}

export function isUndefined(val) {
  return typeof val === 'undefiend'
}

export function isArrayBuffer(val) {
  return toString(val) === 'ArrayBuffer'
}

export function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData)
}

export function isPromise(val) {
  return val !== null &&
    val !== undefined &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
}