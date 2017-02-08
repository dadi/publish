# Users & Authentication

### Overview

Users are currently stored in API and authentication is handled by both Publish and API.

### Requirements

One of the APIs in config should have a **primary** flag. This tells Publish that this API stores and controls authentication. It must also have an **authCollection** value to tell Publish which collection is the be used for storing and retrieving authentication.

Sessions created with credentials stored in the **primary** API cover access to all APIs available in the same instance of Publish, removing the need to login when switching between API instances. The config entry will look something like this:

```json
 {
  "name": "My API",
  "host": "http://hostname.com",
  "port": 3003,
  "primary": true,
  "authCollection": "users",
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
    "username": {
      "type": "String",
      "label": "Username",
      "comments": "Your username",
      "example": "John",
      "validation": {},
      "required": true,
      "message": "can't be empty",
      "display": {
        "index": true,
        "edit": true
      }
    },
    "first_name": {
      "type": "String",
      "label": "First Name",
      "comments": "Your first name",
      "example": "John",
      "validation": {},
      "required": true,
      "message": "can't be empty",
      "display": {
        "index": true,
        "edit": true
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
      "display": {
        "index": true,
        "edit": true
      }
    },
    "password": {
      "type": "String",
      "label": "Password",
      "comments": "Your password",
      "example": "Doe",
      "validation": {
        "min": 8
      },
      "required": true,
      "message": "can't be empty",
      "display": {
        "index": true,
        "edit": true
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
      "display": {
        "index": true,
        "edit": true
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
      "required": true,
      "message": "must be a valid email address",
      "display": {
        "index": true,
        "edit": true
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
    "sort": "username",
    "sortOrder": 1,
    "storeRevisions": true,
    "revisionCollection": "usersHistory",
    "index": {
      "enabled": true,
      "keys": {
        "name": 1
      }
    },
    "description": "Publish authors",
    "hooks": {
      "beforeCreate": [
        {
          "hook": "slugify",
          "options": {
            "from": "username",
            "to": "handle"
          }
        },
        {
          "hook": "password",
          "options": {
            "from": "password"
          }
        }
      ],
      "beforeUpdate": [
        {
          "hook": "slugify",
          "options": {
            "from": "username",
            "to": "handle"
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

const SALT_LENGTH = 10 //salt doesn't need to be super long

/**
 * Hash password
 * - trap hash function with salting
 * @param {string} plaintext - password in Plaintext
 * @param {function} cb - callback function
 * @returns {function} - password as a result of bcrypt hash method
 */
const hash = (plaintext) => {
  return bcrypt.genSalt(SALT_LENGTH).then((err, salt) => {
    if (err) return err
    return bcrypt.hash(plaintext, salt)
  })
}

module.exports = (obj, type, data) => {
  if (obj[data.options.from] && (type === 'beforeCreate' || type === 'beforeUpdate')) {
    return hash(obj[data.options.password]).then((hashed) => {
      obj[data.options.from] = hashed
      return obj
    })
  } else {
    return obj
  }
}
```