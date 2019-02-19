const Testbed = require('@dadi/api-testbed')

const myTest = new Testbed({
  clientId: 'testClient',
  clientSecret: 'testSecret',
  port: 3004,
  uri: 'http://localhost'
})

;
(async () => {
  // Create authors
  await myTest.addData({
    collection: 'team',
    database: 'cloud',
    count: 5,
    fields: {
      name: {
        format: '{{name.firstName}}, {{name.lastName}}'
      },
      body: {
        format: '{{lorem.paragraph}}'
      }
    },
    version: '1.0'
  })

  // Create categories
  await myTest.addData({
    collection: 'categories',
    database: 'cloud',
    count: 5,
    fields: {
      name: {
        format: '{{random.word}}'
      },
      desc: {
        format: '{{lorem.paragraph}}'
      }
    },
    version: '1.0'
  })

  // Create sub-categories
  await myTest.addData({
    collection: 'sub-categories',
    database: 'cloud',
    count: 5,
    fields: {
      name: {
        format: '{{random.word}}'
      }
    },
    version: '1.0'
  })

  // Create web-services
  await myTest.addData({
    collection: 'web-services',
    database: 'cloud',
    count: 5,
    fields: {
      name: {
        format: '{{random.word}}'
      },
      overview: {
        format: '{{random.words(7)}}'
      }
    },
    version: '1.0'
  })

  // Create network-services
  await myTest.addData({
    collection: 'network-services',
    database: 'cloud',
    count: 5,
    fields: {
      name: {
        format: '{{random.word}}'
      },
      overview: {
        format: '{{random.words(7)}}'
      }
    },
    version: '1.0'
  })

  // Add media
  await myTest.addMedia({
    bucket: 'mediaStore',
    count: 5,
    height: 300,
    width: 450
  })

  // Create articles
  await myTest.addData({
    collection: 'articles',
    database: 'cloud',
    count: 5,
    fields: {
      title: {
        format: '{{random.words(4)}}'
      },
      body: {
        format: '{{lorem.paragraph}}'
      },
      author: {
        reference: {
          collection: 'team'
        }
      },
      category: {
        reference: {
          collection: 'categories'
        }
      },
      'sub-category': {
        reference: {
          collection: 'sub-categories'
        }
      },
      'web-service': {
        reference: {
          collection: 'web-services'
        }
      },
      'network-service': {
        reference: {
          collection: 'network-services'
        }
      }
    },
    version: '1.0'
  })
})()