function transformData(data, header, fns) {
  fns.forEach(fn => {
    data = fn(data, header)
  })
  return data
}

export default transformData