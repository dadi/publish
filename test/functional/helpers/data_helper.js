'use strict'

const DADIAPI = require('@dadi/api-wrapper')
const http = require('http')
const FormData = require('form-data')
const fs = require('fs')
const promiseQueue = require('js-promise-queue')

const config = {
  api: {
    protocol: 'http',
    host: process.env.API_HOST,
    port: process.env.API_PORT,
    credentials: {
      clientId: process.env.API_CLIENT_ID,
      secret: process.env.API_CLIENT_SECRET
    }
  }
}

function getApi () {
  return new DADIAPI({
    uri: config.api.protocol + '://' + config.api.host,
    port: config.api.port,
    credentials: {
      clientId: config.api.credentials.clientId,
      secret: config.api.credentials.secret
    },
    version: '1.0',
    database: 'cloud'
  })
}

class Data extends Helper {
  async createClient(id, secret, selectedResources) {
    let client = {
      clientId: id,
      secret: secret
    }

    let api = getApi()

    await api
      .inClients()
      .create(client)
      .then(doc => {
        return this.getToken()
          .then(result => {
            this.addResources(JSON.parse(result).accessToken, client, selectedResources).then(result => {
              // console.log('result :', result)
            })
          })
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  async deleteClient (id) {
    let api = getApi()

    await api
      .inClients()
      .whereClientIs(id)
      .delete()
      .then(() => {
        // console.log('Deleted ' + id)
      }).catch(_err => {
        // console.log('! Error:', err)
      })
  }

  // Create Article for setup
  async createArticle(body, excerpt, title) {
    let api = getApi()

    await api
      .in('articles')
      .create({
        body: body,
        excerpt: excerpt,
        title: title
      })
      .then(doc => {
        // console.log('New document:', doc)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  async deleteArticleByTitle(title) {
    let api = getApi()

    await api
      .in('articles')
      .whereFieldIsEqualTo('title', title)
      .delete()
      .then(() => {
        // console.log('Deleted ' + title)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  async deleteFieldTestBooleans() {
    let api = getApi()

    await api
      .in('field-test-boolean')
      .whereFieldExists('boolRequired')
      .delete()
      .then(() => {
        // console.log('Deleted ' + title)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  async deleteFieldTestDates() {
    let api = getApi()

    await api
      .in('field-test-date')
      .whereFieldExists('dateRequired')
      .delete()
      .then(() => {
        // console.log('Deleted ' + title)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  async deleteFieldTestNumbers() {
    let api = getApi()

    await api
      .in('field-test-number')
      .whereFieldExists('numberRequired')
      .delete()
      .then(() => {
        // console.log('Deleted ' + title)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  // Create Author for setup
  async createTeam(name, body) {
    let api = getApi()

    await api
      .in('team')
      .create({
        name: name,
        body: body
      })
      .then(doc => {
        // console.log('New document:', doc)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  // Create Category for setup
  async createCategory(name, desc) {
    let api = getApi()

    await api
      .in('categories')
      .create({
        name: name,
        desc: desc
      })
      .then(doc => {
        // console.log('New document:', doc)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  // Create SubCategory for setup
  async createSubCategory(name) {
    let api = getApi()

    await api
      .in('sub-categories')
      .create({
        name: name
      })
      .then(doc => {
        // console.log('New document:', doc)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  // Create Network Service for setup
  async createNetworkService(name, overview) {
    let api = getApi()

    await api
      .in('network-services')
      .create({
        name: name,
        overview,
        overview
      })
      .then(doc => {
        // console.log('New document:', doc)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  // Create Web Service for setup
  async createWebService(name, overview) {
    let api = getApi()

    await api
      .in('web-services')
      .create({
        name: name,
        overview,
        overview
      })
      .then(doc => {
        // console.log('New document:', doc)
      }).catch(err => {
        console.log('! Error:', err)
      })
  }

  async createMedia(file) {
    return this.getToken()
      .then(result => {
        let token = JSON.parse(result).accessToken

        let options = {
          host: process.env.API_HOST,
          port: process.env.API_PORT,
          credentials: {
            clientId: process.env.API_CLIENT_ID,
            secret: process.env.API_CLIENT_SECRET
          },
          path: '/media/upload',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }

        let uploadResult = ''
        let form = new FormData()

        form.append('file', fs.createReadStream(file))

        form.submit(options, (err, response, body) => {
          if (err) throw err

          response.on('data', chunk => {
            if (chunk) {
              uploadResult += chunk
            }
          })

          response.on('end', () => {
            // console.log(uploadResult)
          })
        })
      })
  }

  getToken() {
    let postData = JSON.stringify(config.api.credentials)
    // console.log("THIS" + postData)

    let options = {
      hostname: config.api.host,
      port: config.api.port,
      path: `/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this.makeRequest({
      options,
      data: postData
    })
  }

  async getSessionToken (id, secret) {
    let postData = JSON.stringify({
      clientId: id,
      secret: secret
    })

    let options = {
      hostname: config.api.host,
      port: config.api.port,
      path: `/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this.makeRequest({
      options,
      data: postData
    })
  }

  addResources(accessToken, client, selectedResources) {
    let options = {
      hostname: config.api.host,
      port: config.api.port,
      path: `/api/clients/${client.clientId}/resources`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }

    let resourceList = selectedResources || [
      'collection:cloud_articles',
      'media:mediaStore',
      'collection:cloud_team',
      'collection:cloud_categories',
      'collection:cloud_sub-categories',
      'collection:cloud_web-services',
      'collection:cloud_network-services',
      'collection:cloud_field-test-boolean',
      'collection:cloud_field-test-date',
      'collection:cloud_field-test-media',
      'collection:cloud_field-test-number',
      'collection:cloud_field-test-other',
      'collection:cloud_field-test-reference',
      'collection:cloud_field-test-string'
    ]
    let resources = []

    resourceList.forEach(resource => {
      resources.push({
        options: options,
        data: JSON.stringify({
          name: resource,
          access: {
            create: true,
            delete: true,
            read: true,
            update: true
          }
        })
      })
    })

    return promiseQueue(resources, this.makeRequest, {
      interval: 300
    })
  }

  makeRequest (obj) {
    return new Promise((resolve, reject) => {
      let req = http.request(obj.options, (res) => {
        // console.log(`STATUS: ${res.statusCode}`)
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
        let data = ''

        res.setEncoding('utf8')
        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          return resolve(data)
        })
      })

      req.on('error', e => {
        console.error(`problem with request: ${e.message}`)
        return reject(e)
      })

      if (obj.data) {
        // write data to request body
        req.write(obj.data)
      }

      req.end()
    })
  }
}

module.exports = Data