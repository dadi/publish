# Users & Authentication

### Overview

Users are currently stored in API and authentication is handled by both Publish and API.

### Requirements

Whilst there is no requirement for an API to exist for Publish to launch if **config.server.authenticate** is false, one must be present when true.

The Auth block in config stores the credentials for the authentication API. Regardless of whether the same API exists in the **apis** block, this must exist independently for the possibility of a seperate database instance, and the existence of E2E encryption.

The auth block should look similar to an entry in `apis`, but with the adition of `collection`

```json
 {
  "host": "http://hostname.com",
  "port": 3003,
  "collection": "users",
  "database": "my-api",
  "version": "1.0",
  "credentials": {
    "clientId": "testClient",
    "secret": "superSecret"
  }
}
```

### API requirements

API must have available the following collection schema.

```json
{
  "fields": {
    "first_name": {
      "type": "String",
      "label": "First Name",
      "comments": "Your first name",
      "example": "John",
      "validation": {},
      "required": true,
      "message": "can't be empty",
      "publish": {
        "section": "Account",
        "placement": "main",
        "display": {
          "list": true,
          "edit": true
        }
      }
    },
    "last_name": {
      "type": "String",
      "label": "Last Name",
      "comments": "Your last name, including middle names",
      "example": "Doe",
      "validation": {},
      "required": true,
      "message": "can't be empty",
      "publish": {
        "section": "Account",
        "placement": "main",
        "display": {
          "list": true,
          "edit": true
        }
      }
    },
    "email": {
      "type": "String",
      "label": "Email",
      "comments": "Email address",
      "example": "jdoe@dadi.tech",
      "validation": {
        "regex": {
          "pattern": "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
        }
      },
      "publish": {
        "section": "Account",
        "placement": "main",
        "display": {
          "list": true,
          "edit": true
        }
      },
      "required": true,
      "message": "must be a valid email address"
    },
    "bio": {
      "type": "String",
      "label": "Bio",
      "placeholder": "A bit about you...",
      "example": "Doe",
      "validation": {},
      "required": false,
      "publish": {
        "section": "Account",
        "placement": "main",
        "display": {
          "list": false,
          "edit": true
        }
      }
    },
    "profileImage": {
      "type": "Reference",
      "label": "Profile Image",
      "message": "JPEG or PNG",
      "required": false,
      "settings": {
        "collection": "images"
      },
      "publish": {
        "subType": "Image",
        "section": "Account",
        "placement": "sidebar",
        "display": {
          "list": false,
          "edit": true
        }
      }
    },
    "language": {
      "type": "String",
      "label": "Language",
      "message": "Choose your language",
      "required": false,
      "publish": {
        "section": "Settings",
        "placement": "main",
        "display": {
          "list": false,
          "edit": true
        }
      }
    },
    "loginWithToken": {
      "type": "Boolean",
      "label": "Login with Token",
      "message": "Login with token active",
      "publish": {
        "section": "Settings",
        "placement": "main",
        "display": {
          "list": false,
          "edit": false
        }
      }
    },
    "loginToken": {
      "type": "String",
      "label": "Login Token",
      "message": "Generated when password reset is active",
      "publish": {
        "section": "Settings",
        "placement": "main",
        "display": {
          "list": false,
          "edit": false
        }
      }
    },
    "timezone": {
      "type": "String",
      "label": "Timezone",
      "message": "Choose your timezone",
      "required": false,
      "default": "GMT",
      "publish": {
        "section": "Settings",
        "placement": "main",
        "display": {
          "list": false,
          "edit": true
        }
      }
    },
    "datetimeFormat": {
      "type": "String",
      "label": "Date/Time Format",
      "message": "Choose your format",
      "required": false,
      "default": "YYYY-MM-DD HH:MM:SS",
      "validation": {
        "regex": {
          "pattern": "[YYYY\\-MM\\-DD HH:MM:SS|DD\\-MM\\-YYYY HH:MM:SS|YYYY\\-DD\\-MM HH:MM:SS|MM\\-DD\\-YYYY HH:MM:SS]"
        }
      },
      "publish": {
        "section": "Settings",
        "placement": "main",
        "display": {
          "list": false,
          "edit": true
        },
        "options": [
          {
            "value": "YYYY-MM-DD HH:MM:SS",
            "label": "Year-Month-Day"
          },
          {
            "value": "YYYY-DD-MM HH:MM:SS",
            "label": "Year-Day-Month"
          },
          {
            "value": "DD-MM-YYYY HH:MM:SS",
            "label": "Day-Year-Month"
          },
          {
            "value": "MM-DD-YYYY HH:MM:SS",
            "label": "Month-Day-Year"
          }
        ]
      }
    },
    "password": {
      "type": "String",
      "label": "Password",
      "comments": "Your password",
      "example": "My Pass",
      "required": true,
      "message": "can't be empty",
      "publish": {
        "subType": "Password",
        "section": "Password reset",
        "placement": "main",
        "display": {
          "list": false,
          "edit": true
        }
      }
    },
    "handle": {
      "type": "String",
      "label": "handle",
      "comments": "URL-friendly name",
      "example": "john-doe",
      "validation": {},
      "required": false,
      "message": "can't be empty",
      "publish": {
        "display": {
          "list": false,
          "edit": true
        },
        "readonly": true
      }
    }
  },
  "settings": {
    "compose": true,
    "cache": false,
    "authenticate": true,
    "callback": null,
    "defaultFilters": null,
    "fieldLimiters": null,
    "count": 20,
    "sort": "createdAt",
    "sortOrder": 1,
    "storeRevisions": true,
    "revisionCollection": "usersHistory",
    "index": {
      "enabled": true,
      "keys": {
        "name": 1
      }
    },
    "displayName": "Publish authors",
    "hooks": {
      "beforeCreate": [
        {
          "hook": "slugify",
          "options": {
            "from": "email",
            "to": "handle"
          }
        },
        {
          "hook": "publish-auth",
          "options": {
            "usernameField": "email",
            "passwordField": "password",
            "resetField": "loginWithToken",
            "tokenField": "loginToken"
          }
        }
      ],
      "beforeUpdate": [
        {
          "hook": "slugify",
          "options": {
            "from": "email",
            "to": "handle"
          }
        },
        {
          "hook": "publish-auth",
          "options": {
            "usernameField": "email",
            "passwordField": "password",
            "resetField": "loginWithToken",
            "tokenField": "loginToken"
          }
        }
      ],
      "afterGet": [
        {
          "hook": "publish-auth",
          "options": {
            "usernameField": "email",
            "passwordField": "password",
            "resetField": "loginWithToken",
            "tokenField": "loginToken"
          }
        }
      ]
    }
  }
}
```

#### API hooks

The **Slugify** hook is currently required. It forces the creation of a handle to be used in the url when accessing a user account in Publish. It looks like this:

```javascript
'use strict'
// Hook: Creates a URL-friendly version (slug) of a field
const slugify = require("underscore.string/slugify")
const _ = require('underscore')

const getFieldValue = (fieldName, object) => {
  if (!fieldName) return
    fieldName = fieldName.split('.')
  _.each(fieldName, (child) => {
    if (!_.isUndefined(object[child])) {
      object = object[child]
    } else {
      return
    }
  })
  return Boolean(object.length) ? object : false
}

module.exports = (obj, type, data) => {
  let object = _.clone(obj)
  let field = getFieldValue(data.options.override, object) || getFieldValue(data.options.from, object)
  if (field) {
    obj[data.options.to] = slugify(field)
  }
  return obj
}
```

The **Password** hook is not required. It is used to hash new passwords, and to perform password matches on GET. It looks like this.
(This will need updating once the password match check has been added)

```javascript
'use strict'

const bcrypt = require('bcrypt-as-promised')
const config = require('@dadi/api').Config
const Model = require('@dadi/api').Model
const url = require('url')
const uuid = require('uuid')
const nodemailer = require('nodemailer')

const ERROR_API_FAILURE = 'API_FAILURE'
const ERROR_USER_EXISTS = 'USER_EXISTS'
const ERROR_WRONG_CREDENTIALS = 'WRONG_CREDENTIALS'
const SALT_LENGTH = 10 // salt doesn't need to be super long

/**
 * Handles authentication for DADI Publish.
 */
module.exports = (obj, type, data) => {
  let params = url.parse(data.req.url, true).query
  let filter = params && params.filter ? JSON.parse(params.filter) : null
  const body = data.req ? data.req.body : null

  let usernameField = data.options.usernameField
  let passwordField = data.options.passwordField
  let resetField = data.options.resetField
  let tokenField = data.options.tokenField

  switch (type) {
    // `afterGet` is responsible for auth check when both username/email and
    // password are part of the filter.
    case 'afterGet':
      // If both email and password exist, treat this as a login.
      if (filter && filter[usernameField] && filter[passwordField]) {
        return authenticate(filter[usernameField], filter[passwordField], data).then(user => {
          return {
            results: [user]
          }
        })
      } else {
        // Standard user lookup.
        return Object.assign(obj, {results: obj.results.map(doc => {
          delete doc.password

          return doc
        })})
      }

      break

    // `beforeCreate` is responsible for ensuring users are unique and that password
    // are hashed before documents are created.
    case 'beforeCreate':

      return getUser(obj[data.options.usernameField], data).then(user => {
        if (user) {
          return Promise.reject(buildError(ERROR_USER_EXISTS))
        }

        return hash(obj[data.options.passwordField]).then(hashedPassword => {
          obj[data.options.passwordField] = hashedPassword

          return obj
        }).catch(err => {
          return Promise.reject(buildError(ERROR_API_FAILURE))
        })
      })

      break

    // `beforeUpdate` is responsible for checking for a password change attempt,
    // validating the current password supplied against the one saved in the record.
    // It also hashes the new password.
    case 'beforeUpdate':

      // If we're performing an update, hash the password
      if (body && body.query && body.query.loginToken && obj.password) {
        const password = obj.password

        return hash(password).then(hashedPassword => {
          obj[passwordField] = hashedPassword
          obj[tokenField] = null
          obj[resetField] = false

          return obj
        })
      }

      const current = data.updatedDocs[0]

      // If reset parameter is true, create a new token. This invalidates previous token.
      if (obj[data.options.resetField] && !data.updatedDocs[0].loginToken) {
        const token = uuid.v4()
        const email = current.email
        const emailOptions = generateEmail({email, token})
        obj[data.options.tokenField] = token

        if (email && emailOptions && token) {
          sendEmail(emailOptions)
        }
        return obj
      }

      if (data.req.body.update[passwordField]) {
        try {
          let username = data.req.body.query[usernameField]
          let password = JSON.parse(data.req.body.update[passwordField])

          if (password.current && password.new) {
            return authenticate(username, password.current, data).then(user => {
              return hash(password.new).then(hashedPassword => {
                obj[passwordField] = hashedPassword

                return obj
              })
            })
          }
        } catch (err) {
          console.log(err.stack)
          throw buildError(ERROR_API_FAILURE)
        }
      }

      return obj

    default:
      return obj
  }
}

/**
 * Authenticate with the given user and password
 *
 * @param {string} email - The user email
 * @param {string} password - The user password
 * @param {object} data - The hook data object
 *
 * @returns {Promise} - A resolved Promise if the authentication was
 * successful; rejected with a string error otherwise
 */
const authenticate = (email, password, data) => {
  let passwordField = data.options.passwordField

  if (!password) {
    return Promise.reject(buildError(ERROR_WRONG_CREDENTIALS))
  }

  return getUser(email, data).then(user => {
    if (!user) {
      return Promise.reject(buildError(ERROR_WRONG_CREDENTIALS))
    }

    // Comparing
    return compare(password, user[passwordField]).then(match => {
      if (match) {
        delete user[passwordField]

        return user
      }

      return Promise.reject(buildError(ERROR_WRONG_CREDENTIALS))
    }).catch(err => {
      return Promise.reject(buildError(ERROR_WRONG_CREDENTIALS))
    })
  })
}

/**
 * Builds a custom error
 *
 * @param {string} code - The custom error code
 * @param {string} message - The error message
 *
 * @returns {Error} - The custom error
 */
const buildError = (code, details) => {
  let error = new Error(details)

  error.code = code

  return error
}

/**
 * Gets a user document
 *
 * @param {string} email - The user email
 * @param {object} data - The hook data object
 *
 * @returns {Promise} - A user object if a user is found,
 * null otherwise
 */
const getUser = (email, data) => {
  let usernameField = data.options.usernameField

  let query = {
    apiVersion: '1.0',
    [usernameField]: email
  }

  return new Promise((resolve, reject) => {
    // Getting user record
    Model(data.collection).find(query, {limit: 1}, (err, user) => {
      if (user.results.length < 1) {
        return resolve(null)
      }

      return resolve(user.results[0])
    })
  })
}

/**
 * Send Email
 * @param  {Object} options Email options
 */
const sendEmail = (options) => {
  const auth = `smtps://${config.get('email.username')}:${config.get('email.password')}@${config.get('email.host')}`
  const transporter = nodemailer.createTransport(auth)

  transporter.sendMail(options, (error, info) => {
    if (error) {
      return console.log(error)
    }
  })
}

/**
 * Generate email
 * Generates html and plaintext email with config options.
 * @param  {String} options.email Recipient email address.
 * @param  {[type]} options.token Token to be included in email.
 * @return {Object} Formatted email options.
 */
const generateEmail = ({email, token}) => {
  if (!config.get('email')) return false

  return {
    from: `"${config.get('email.from')}" <${config.get('email.from')}>`,
    to: email,
    subject: 'Password reset request',
    text: `Click here to reset your password: http://am.dev.dadi.technology:3000/sign-in/${token}`,
    html: `Click here to reset your password: http://am.dev.dadi.technology:3000/sign-in/${token}`
  }
}

/**
 * Compare password (wrapper for bcrypt compare)
 *
 * @param {string} plaintext - Password in Plaintext
 * @param {string} hash - The password hash to be applied
 *
 * @returns {Promise} - Instance of bcrypt compare method
 */
const compare = (plaintext, hash) => {
  return bcrypt.compare(plaintext, hash)
}

/**
 * Hash password (trap hash function with salting)
 *
 * @param {string} plaintext - password in Plaintext
 * @returns {Promise} - password as a result of bcrypt hash method
 */
const hash = plaintext => {
  return bcrypt.genSalt(SALT_LENGTH)
     .then((salt, err) => {
       if (err) return err

       return bcrypt.hash(plaintext, salt)
     })
}
```
