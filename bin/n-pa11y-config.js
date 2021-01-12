#!/usr/bin/env node

const program = require('commander')

program.version(require('../package.json').version)

program
  .command('run [file]')
  .description('Runs Pa11y CI over the provided tests file.')
  .option('-h, --host <host>', 'Base RUL to apply to all test routes')
  .option('-w, --wait <wait>', 'The time to wait before running tests in milliseconds')
  .option('-e, --exceptions <exceptions>', 'Routes returning 200 that should not be tested')
  .option(
    '-i, --hide <hide>',
    'CSS selector to hide elements from testing, selectors can be comma separated'
  )
  .option(
    '-h, --headers <headers>',
    'Headers to be added to every test route. This is a comma separated key value list (key1=value1,key2=value2)'
  )
  .option('-v, --viewports <viewports>', 'Set viewports for puppeteer (`w1024h768,w375h667`)')
  .action(async function (file, options) {
    try {
      const run = require('../tasks/run')
      await run(file, options)
    } catch (err) {
      console.error(err)
    }
  })

program
  .command('*')
  .description('')
  .action(function (app) {
    utils.exit(`The command ${app} is not known`)
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
