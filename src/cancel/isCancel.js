function isCancel(value) {
  return !!(value && value.__CANCEL__)
}

export default isCancel