'use strict'

module.exports = {
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
          "editor": true
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
          "editor": true
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
          "editor": true
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
          "editor": true
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
          "editor": true
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
          "editor": true
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
          "editor": true
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
          "editor": true
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
          "editor": true
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
          "editor": true
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
            "passwordField": "password"
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
            "passwordField": "password"
          }
        }
      ],
      "afterGet": [
        {
          "hook": "publish-auth",
          "options": {
            "usernameField": "email",
            "passwordField": "password"
          }
        }
      ]
    }
  }
}