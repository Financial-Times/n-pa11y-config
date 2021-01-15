const process = require('process')
const extend = require('node.extend')
const querystring = require('querystring')
const {URL} = require('url')
const path = require('path')
const mkdirp = require('mkdirp')
const parser = require('./lib/parser')

const DEFAULT_FLAGS = 'ads:off,sourcepoint:off,cookieMessage:off'
const DEFAULT_VIEWPORT = {
  width: 1280,
  height: 800,
}

// Args received from the 'run' task
const args = {
  file: process.env.PA11Y_TEST_FILE,
  host: process.env.PA11Y_HOST,
  wait: process.env.PA11Y_WAIT || 300,
  exceptions: process.env.PA11Y_ROUTE_EXCEPTIONS,
  hide: process.env.PA11Y_HIDE,
  viewports: process.env.PA11Y_VIEWPORTS,
  headers: process.env.PA11Y_HEADERS,
  screenCapturePath: process.env.PA11Y_SCREEN_CAPTURE_PATH,
}

console.log('Init Pa11y config for tests: ', process.cwd(), args.file)

const smoke = require(args.file)

// What routes returning 200 in smoke.js should we not test?
const exceptions = args.exceptions ? args.exceptions.split(',') : []
const viewports = [DEFAULT_VIEWPORT].concat(parser.parseEnvironmentViewPorts(args.viewports))

/**
 * Headers can be set:
 * - globally for all apps, in config.defaults.headers here
 * - per test, in smoke.js
 * Headers objects will be merged, cookies and flags will be concatenated
 * No flags allowed inside the cookie for easier merging: use the FT-Flags header instead
 */

// Add any global config (inc headers) here
const config = {
  defaults: {
    headers: {
      Cookie: 'secure=true',
      'FT-Flags': DEFAULT_FLAGS,
    },
    timeout: 50000,
    wait: args.wait,
    hideElements: 'iframe[src*=google],iframe[src*=proxy],iframe[src*=doubleclick]',
    rules: ['Principle1.Guideline1_3.1_3_1_AAA'],
  },
  urls: [],
}

// What elements should we not run pa11y on (i.e. google ad iFrames)
// Use with caution. May break the experience for users.
config.defaults.hideElements = args.hide
  ? `${args.hide},${config.defaults.hideElements}`
  : config.defaults.hideElements

console.log('args.exceptions:', args.exceptions)
console.log('exceptions:', exceptions)
console.log('args.hide:', args.hide)
console.log('config.defaults.hideElements:', config.defaults.hideElements)

// Don't console.log headers once Header args is added to the object (possible private keys added)
config.defaults.headers = {
  ...config.defaults.headers,
  ...parser.parseStringArgToMap(args.headers),
}

const urls = []
smoke.forEach((smokeConfig) => {
  for (let url in smokeConfig.urls) {
    let isException = false

    exceptions.forEach((path) => {
      isException = isException || url.indexOf(path) !== -1
    })

    const expectedStatus =
      typeof smokeConfig.urls[url] === 'number'
        ? smokeConfig.urls[url]
        : smokeConfig.urls[url].status
    if (expectedStatus !== 200 || url === '/__health' || isException) {
      continue
    }

    const thisUrl = {
      url: args.host + url,
    }

    // Do we have test-specific headers?
    if (smokeConfig.headers) {
      // Merge the headers
      thisUrl.headers = Object.assign({}, config.defaults.headers, smokeConfig.headers)

      // concatenate any test-specific cookies
      if (smokeConfig.headers.Cookie) {
        console.log('• merging cookies...')

        // Keep flags out of the cookie for easier merging
        if (smokeConfig.headers.Cookie.indexOf('flags') !== -1) {
          throw Error("please don't set any flags inside the Cookie. Use the 'FT-Flags' header")
        }

        // Set the concatenated cookies
        thisUrl.headers.Cookie = smokeConfig.headers.Cookie + '; ' + config.defaults.headers.Cookie
      }

      // concatenate any test-specific flags
      if (smokeConfig.headers['FT-Flags']) {
        console.log('• merging flags...')

        // Set the concatenated flags
        thisUrl.headers['FT-Flags'] =
          smokeConfig.headers['FT-Flags'] + ',' + config.defaults.headers['FT-Flags']
      }
    }

    if (smokeConfig.method) thisUrl.method = smokeConfig.method

    if (smokeConfig.body) {
      thisUrl.postData = ((contentType) => {
        switch (contentType) {
          case 'application/x-www-form-urlencoded':
            return querystring.stringify(smokeConfig.body)
          case 'application/json':
            return JSON.stringify(smokeConfig.body)
          default:
            return smokeConfig.body
        }
      })(smokeConfig.headers['Content-Type'])
    }

    urls.push(thisUrl)
  }
})

for (let viewport of viewports) {
  for (let url of urls) {
    const resultUrl = extend(true, {viewport: viewport}, url)

    if (args.host.includes('local')) {
      const pathname = new URL(resultUrl.url).pathname
      const screenshotName = pathname.substring(1).replace(/\//g, '_')

      let appFlags = 'no-flags'

      if (resultUrl.headers) {
        const flags = resultUrl.headers['FT-Flags']
        appFlags = flags.substring(0, flags.indexOf(DEFAULT_FLAGS) - 1)
      }

      const folderName = `${screenCapturePath}/${viewport.width}x${viewport.height}/${appFlags}`

      mkdirp.sync(path.join(process.cwd(), folderName))
      resultUrl.screenCapture = `.${folderName}/${screenshotName || 'root'}.png`
    }

    config.urls.push(resultUrl)
  }
}

module.exports = config
