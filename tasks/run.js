'use strict'

const {spawn} = require('child_process')

function run(config) {
  const testFile = config.PA11Y_TEST_FILE

  if (!testFile) {
    console.error('Pa11y-config: Tests file not specified')
    return
  }

  return new Promise((resolve, reject) => {
    console.log(`Running Pa11y CI on ${testFile}`)
    const pa11y = spawn('pa11y-ci', {env: {...process.env, ...config}})
    pa11y.stdout.pipe(process.stdout)
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
