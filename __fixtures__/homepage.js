module.exports = [
  {
    name: 'Home pages',
    urls: {
      '/__health': {
        status: 200,
        responseHeaders: {
          'Cache-Control': 'no-store',
          'Surrogate-Control': 'no-store',
        },
      },
      '/__redirect': {
        status: 302,
      },
      '/page/home-uk': {
        status: 200,
        responseHeaders: {
          'Cache-Control': 'no-store',
          'Surrogate-Control': 'no-store',
        },
      },
      '/page/home-international': {
        status: 200,
        responseHeaders: {
          'Cache-Control': 'no-store',
          'Surrogate-Control': 'no-store',
        },
      },
    },
  },
]
