const Testbed = require('@dadi/api-testbed')

const myTest = new Testbed({
  clientId: process.env.API_CLIENT_ID,
  clientSecret: process.env.API_CLIENT_SECRET,
  port: process.env.API_PORT,
  uri: 'http://localhost'
})

class Bootstrap {
  run() {
    return new Promise(async (resolve, reject) => {
      // Create authors
      await myTest.addData({
        collection: 'team',
        count: 5,
        property: 'cloud',
        fields: {
          body: {
            format: '{{lorem.paragraph}}'
          },
          linkedIn: {
            format: '{{internet.userName}}'
          },
          name: {
            format: '{{name.firstName}}, {{name.lastName}}'
          },
          personalSite: {
            format: '{{internet.url}}'
          },
          twitter: {
            format: '{{internet.userName}}'
          }
        }
      })

      // Create categories
      await myTest.addData({
        collection: 'categories',
        count: 5,
        property: 'cloud',
        fields: {
          desc: {
            format: '{{lorem.paragraph}}'
          },
          name: {
            format: '{{random.word}}'
          }
        }
      })

      // Create sub-categories
      await myTest.addData({
        collection: 'sub-categories',
        count: 5,
        property: 'cloud',
        fields: {
          name: {
            format: '{{random.word}}'
          }
        }
      })

      // Create web-services
      await myTest.addData({
        collection: 'web-services',
        count: 5,
        property: 'cloud',
        fields: {
          name: {
            format: '{{random.word}}'
          },
          overview: {
            format: '{{random.words(7)}}'
          }
        }
      })

      // Create network-services
      await myTest.addData({
        collection: 'network-services',
        count: 5,
        property: 'cloud',
        fields: {
          name: {
            format: '{{random.word}}'
          },
          overview: {
            format: '{{random.words(7)}}'
          }
        }
      })

      // Create articles
      await myTest.addData({
        collection: 'articles',
        count: 4,
        property: 'cloud',
        fields: {
          author: {
            reference: {
              collection: 'team'
            },
            transform: value => (Array.isArray(value) ? value : [value])
          },
          body: {
            format: '{{lorem.paragraph}}'
          },
          category: {
            reference: {
              collection: 'categories'
            }
          },
          'network-service': {
            reference: {
              collection: 'network-services'
            }
          },
          published: {
            format: '{{random.boolean}}',
            transform: value => (value === 'true' ? true : false)
          },
          publishedAt: {
            format: '{{date.past}}',
            transform: value => {
              const date = new Date(value)

              return date
            }
          },
          'sub-category': {
            reference: {
              collection: 'sub-categories'
            }
          },
          title: {
            format: '{{random.words(4)}}'
          },
          'web-service': {
            reference: {
              collection: 'web-services'
            }
          }
        }
      })

      // Create filter articles
      await myTest.addData({
        cleanup: false,
        collection: 'articles',
        count: 3,
        property: 'cloud',
        fields: {
          author: {
            reference: {
              collection: 'team'
            }
          },
          body: {
            format: '{{lorem.paragraph}}'
          },
          category: {
            reference: {
              collection: 'categories'
            }
          },
          'network-service': {
            reference: {
              collection: 'network-services'
            }
          },
          published: {
            format: '{{random.boolean}}',
            transform: value => (value === 'true' ? true : false)
          },
          publishedAt: {
            format: '{{date.past}}',
            transform: value => {
              const date = new Date(value)

              return date
            }
          },
          'sub-category': {
            reference: {
              collection: 'sub-categories'
            }
          },
          title: {
            format: '{{random.word(2)}}',
            transform: value => 'DADI ' + value
          },
          'web-service': {
            reference: {
              collection: 'web-services'
            }
          }
        }
      })

      return resolve()
    })
  }
}

module.exports = Bootstrap
