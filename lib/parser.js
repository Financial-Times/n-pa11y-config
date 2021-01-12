function parseEnvironmentViewPort(viewportStr) {
  const result = /w(\d{2,4})h(\d{2,4})/i.exec(viewportStr)
  if (!result || result.length < 3) {
    return null
  }

  return {width: Number(result[1]), height: Number(result[2])}
}

function parseEnvironmentViewPorts(viewports) {
  if (!viewports) {
    return []
  }

  return viewports
    .split(',')
    .map(parseEnvironmentViewPort)
    .filter((v) => v)
}

function parseStringArgToMap(arg) {
  const result = {}
  if (!arg) {
    return result
  }

  const pairs = arg.split(',')
  for (pair of pairs) {
    const [key, value] = pair.split('=')
    result[key] = value
  }

  return result
}

module.exports = {
  parseEnvironmentViewPort,
  parseEnvironmentViewPorts,
  parseStringArgToMap,
}
