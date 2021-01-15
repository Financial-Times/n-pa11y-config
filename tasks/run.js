const path = require('path')
const {spawn} = require('child_process')

function run(file, options) {
  if (!file) {
    console.error('Pa11y-config: Tests file not specified')
    return
  }

  const args = {
    PA11Y_TEST_FILE: file,
    PA11Y_HOST: options.host,
    PA11Y_WAIT: options.wait,
    PA11Y_ROUTE_EXCEPTIONS: options.exceptions,
    PA11Y_HIDE: options.hide,
    PA11Y_VIEWPORTS: options.viewports,
    PA11Y_HEADERS: options.headers,
    PA11Y_SCREEN_CAPTURE_PATH: options.screenCapturePath,
  }

  return new Promise((resolve, reject) => {
    console.log(`Running Pa11y CI on ${file}`)
    const pa11y = spawn('pa11y-ci', ['--config', path.join(__dirname, '../.pa11yci.js')], {
      env: {...process.env, ...args},
    })
    pa11y.stdout.pipe(process.stdout)
    pa11y.stderr.pipe(process.stderr)

    pa11y.on('error', (error) => {
      reject(error)
    })
    pa11y.on('close', (code) => {
      console.log(`Pa11y exited with code ${code}`)
      resolve(code)
    })
  })
}

module.exports = run
