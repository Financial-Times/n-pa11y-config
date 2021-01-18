const process = require('process')
const extend = require('node.extend')
const querystring = require('querystring')
const {URL} = require('url')
const path = require('path')
const mkdirp = require('mkdirp')

const DEFAULT_WAIT = 300
const DEFAULT_FLAGS = 'ads:off,sourcepoint:off,cookieMessage:off'
const DEFAULT_VIEWPORT = {
  width: 1280,
  height: 800,
}
const DEFAULT_HIDE_ELEMENTS = [
  'iframe[src*=google]',
  'iframe[src*=proxy]',
  'iframe[src*=doubleclick]',
]
const DEFAULT_HEADERS = {
  Cookie: 'secure=true',
  'FT-Flags': DEFAULT_FLAGS,
}

function shouldExcludeUrl(exceptions, url, urlResult) {
  const expectedStatus = typeof urlResult === 'number' ? urlResult : urlResult.status
  const isException = exceptions.find((path) => url.indexOf(path) >= 0)

  return expectedStatus !== 200 || url === '/__health' || isException
}

function mergeHeaders(commonHeaders, testHeaders = {}) {
  const result = Object.assign({}, commonHeaders, testHeaders)

  if (testHeaders.Cookie) {
    // Keep flags out of the cookie for easier merging
    if (testHeaders.Cookie.indexOf('flags') !== -1) {
      throw Error("please don't set any flags inside the Cookie. Use the 'FT-Flags' header")
    }

    result.Cookie = testHeaders.Cookie + '; ' + commonHeaders.Cookie
  }

  if (testHeaders['FT-Flags']) {
    result['FT-Flags'] = testHeaders['FT-Flags'] + ',' + commonHeaders['FT-Flags']
  }

  return result
}

/** Generates a configuration object for the Pa11y CI tool
 * @param {Object} config - Project required configuration
 * @returns {Object} - Configuration object required by Pa11y CI
 */

function getPa11yConfiguration({
  tests,
  host = '',
  exceptions = [],
  wait = DEFAULT_WAIT,
  hide = [],
  viewports = [],
  headers,
  screenCapturePath = 'screenCaptures',
}) {
  if (!tests || !Array.isArray(tests)) {
    throw new Error('A valid array of tests is missing')
  }

  const pa11yConfig = {
    defaults: {
      headers: {
        ...DEFAULT_HEADERS,
        ...headers,
      },
      timeout: 50000,
      wait,
      hideElements: DEFAULT_HIDE_ELEMENTS.concat(hide).join(','),
      rules: ['Principle1.Guideline1_3.1_3_1_AAA'],
    },
    urls: [],
  }

  const urls = []
  tests.forEach((test) => {
    for (let url in test.urls) {
      if (shouldExcludeUrl(exceptions, url, test.urls[url])) {
        continue
      }

      const thisUrl = {
        url: host + url,
        headers: test.headers && mergeHeaders(pa11yConfig.defaults.headers, test.headers),
        method: test.method,
      }

      if (test.body) {
        thisUrl.postData = ((contentType) => {
          switch (contentType) {
            case 'application/x-www-form-urlencoded':
              return querystring.stringify(test.body)
            case 'application/json':
              return JSON.stringify(test.body)
            default:
              return test.body
          }
        })(test.headers['Content-Type'])
      }

      urls.push(thisUrl)
    }
  })

  const finalViewports = [DEFAULT_VIEWPORT].concat(viewports)
  for (let viewport of finalViewports) {
    for (let url of urls) {
      const resultUrl = extend(true, {viewport: viewport}, url)

      if (host.includes('local')) {
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

      pa11yConfig.urls.push(resultUrl)
    }
  }

  return pa11yConfig
}

module.exports = getPa11yConfiguration
