const nPa11yConfig = require('./index')
const homepageSmokeFixture = require('./__fixtures__/homepage')

describe('nPa11yConfig', () => {
  let config
  beforeEach(() => {
    config = {tests: homepageSmokeFixture}
  })

  describe('Configuration override', () => {
    test('it should throw an Error when no test provided', () => {
      expect(() => {
        nPa11yConfig()
      }).toThrow(Error)
    })

    test('it should return an object with the default configuration', () => {
      const config = {tests: homepageSmokeFixture}
      expect(nPa11yConfig(config)).toMatchSnapshot()
    })

    test('it should set the wait to 1000ms', () => {
      config.wait = 1000
      const {defaults} = nPa11yConfig(config)

      expect(defaults.wait).toBe(1000)
    })

    test('it should use the host prop in all the result urls', () => {
      config.host = 'https://ft1.heroku.com'
      const {urls} = nPa11yConfig(config)

      urls.forEach((url) => expect(url.url.indexOf(config.host)).toBe(0))
    })

    test('it should exclude the routes added as exceptions', () => {
      config.exceptions = ['/page/home-uk']
      const {urls} = nPa11yConfig(config)

      expect(urls.find((url) => url.url === config.exceptions[0])).toBe(undefined)
      expect(urls.find((url) => url.url === '/page/home-international')).not.toBe(undefined)
    })

    test('it should include an extra "object" element to hide', () => {
      config.hide = ['object']
      const {defaults} = nPa11yConfig(config)

      expect(defaults.hideElements).toMatch(config.hide[0])
    })

    test('it should include the 300x600 viewport to the result urls', () => {
      config.viewports = [{width: 300, height: 600}]
      const {urls} = nPa11yConfig(config)

      expect(
        urls.filter((url) => JSON.stringify(url.viewport) === JSON.stringify(config.viewports[0]))
          .length
      ).toBe(2)
    })

    test('it should include the specified header in the result defaults', () => {
      config.headers = {'FT-Flags': 'homePage:on'}
      const {defaults} = nPa11yConfig(config)

      expect(defaults.headers['FT-Flags']).toBe(config.headers['FT-Flags'])
    })

    test('it should use "/output" as the screenshot output folder', () => {
      config.screenCapturePath = '/output'
      config.host = 'https://localhost:3000'
      const {urls} = nPa11yConfig(config)

      expect(urls[0].screenCapture).toMatch(config.screenCapturePath)
    })
  })

  describe('main logic', () => {
    test('it should not include screenCapture for hosts different than localhost', () => {
      config.screenCapturePath = '/output'
      config.host = 'https://ft.heroku.com'
      const {urls} = nPa11yConfig(config)

      expect(urls[0].screenCapture).toBeUndefined()
    })

    test('it should ignore the routes with status code different than 200', () => {
      const config = nPa11yConfig({
        tests: [
          {
            name: 'Home pages',
            urls: {
              '/__redirect': {
                status: 302,
              },
            },
          },
        ],
      })

      expect(config.urls).toHaveLength(0)
    })

    test('it should ignore the "/__health" routes', () => {
      const config = nPa11yConfig({
        tests: [
          {
            name: 'Home pages',
            urls: {
              '/__health': {
                status: 200,
              },
            },
          },
        ],
      })

      expect(config.urls).toHaveLength(0)
    })

    test('it should throw an exception when trying to set flags cookie inside a test header', () => {
      expect(() => {
        const config = nPa11yConfig({
          tests: [
            {
              name: 'Home pages',
              headers: {
                Cookie: 'flags=myflag',
              },
              urls: {
                '/page/home-uk': {
                  status: 200,
                },
              },
            },
          ],
        })
      }).toThrow(Error)
    })

    test('it should merge the cookies provided by the test', () => {
      const test = {
        name: 'Home pages',
        headers: {
          Cookie: '_ga=GA1.2.1725153788; _gid=GA1.2.738908361',
        },
        urls: {
          '/page/home-uk': {
            status: 200,
          },
        },
      }
      const config = nPa11yConfig({
        tests: [test],
      })

      expect(config.urls[0].headers.Cookie).toMatch(test.headers.Cookie)
    })
  })
})
