const parser = require('./parser')

describe('parser module', () => {
  describe('parseStringArgToMap()', () => {
    test('returns empty object when no parameter provided', () => {
      expect(parser.parseStringArgToMap()).toEqual({})
    })

    test('returns a map with the parameter provided', () => {
      expect(parser.parseStringArgToMap('key1=value1,key2=value2')).toEqual({
        key1: 'value1',
        key2: 'value2',
      })
    })
  })

  describe('parseEnvironmentViewPort()', () => {
    test('returns an object with the width and height provided', () => {
      expect(parser.parseEnvironmentViewPort('w1080h840')).toEqual({
        width: 1080,
        height: 840,
      })
    })
    test('returns null when width or height is a number below 10', () => {
      expect(parser.parseEnvironmentViewPort('w1080h9')).toBeNull()
      expect(parser.parseEnvironmentViewPort('w8h840')).toBeNull()
    })
  })

  describe('parseEnvironmentViewPorts()', () => {
    test('returns an empty array when no parameter provided', () => {
      expect(parser.parseEnvironmentViewPorts()).toEqual([])
    })

    test('returns a list with all viewports parsed', () => {
      expect(parser.parseEnvironmentViewPorts('w1080h840,w1240h980')).toEqual([
        {
          width: 1080,
          height: 840,
        },
        {
          width: 1240,
          height: 980,
        },
      ])
    })

    test('returns a list with all viewports parsed but removing the incorrect viewports', () => {
      expect(parser.parseEnvironmentViewPorts('w1080h840,w1240h9')).toEqual([
        {
          width: 1080,
          height: 840,
        },
      ])
    })
  })
})
