export const API_CONNECTION_ERROR = 'API_CONNECTION_ERROR'
export const API_UNAUTHORISED_ERROR = 'API-0005'
export const BATCH_ACTIONS = 'BATCH_ACTIONS'
export const DEFAULT_FIELDS = [
  '_createdAt',
  '_createdBy',
  '_lastModifiedAt',
  '_lastModifiedBy'
]
export const ERROR_DOCUMENT_NOT_FOUND = 'ERROR_DOCUMENT_NOT_FOUND'
export const ERROR_MISSING_FIELDS = 'ERROR_MISSING_FIELDS'
export const ERROR_PASSWORD_MISMATCH = 'ERROR_PASSWORD_MISMATCH'
export const ERROR_ROUTE_NOT_FOUND = 'ERROR_ROUTE_NOT_FOUND'
export const ERROR_WRONG_PASSWORD = 'The current password is incorrect'
export const FIELD_SAVE_OPTIONS = 'publishSaveOptionsLastUsed'
export const MEDIA_COLLECTION = 'mediaStore'
/* eslint-disable sort-keys */
export const MEDIA_COLLECTION_SCHEMA = {
  IS_MEDIA_BUCKET: true,
  _publishLink: '/media',
  fields: {
    fileName: {
      label: 'Filename',
      publish: {
        readonly: true,
        section: 'Details'
      },
      type: 'String'
    },
    mimeType: {
      label: 'Type',
      publish: {
        readonly: true,
        section: 'Details'
      },
      type: 'String'
    },
    altText: {
      label: 'Alternative text',
      type: 'String',
      publish: {
        section: 'Metadata'
      }
    },
    caption: {
      label: 'Caption',
      type: 'String',
      publish: {
        section: 'Metadata'
      }
    },
    copyright: {
      label: 'Copyright information',
      type: 'String',
      publish: {
        section: 'Metadata'
      }
    },
    height: {
      label: 'Height',
      publish: {
        readonly: true,
        section: 'Details'
      },
      type: 'Number'
    },
    width: {
      label: 'Width',
      publish: {
        readonly: true,
        section: 'Details'
      },
      type: 'Number'
    },
    url: {
      label: 'URL',
      publish: {
        readonly: true,
        section: 'Details'
      },
      type: 'String'
    }
  },
  name: 'Media Library',
  slug: 'media'
}
export const NETWORK_OK = 'NETWORK_OK'
export const NETWORK_NO_INTERNET_CONNECTION = 'NETWORK_NO_INTERNET_CONNECTION'
export const NETWORK_SERVER_UNRESPONSIVE = 'NETWORK_SERVER_UNRESPONSIVE'
export const NOTIFICATION_TYPE_SUCCESS = 'NOTIFICATION_TYPE_SUCCESS'
export const NOTIFICATION_TYPE_ERROR = 'NOTIFICATION_TYPE_ERROR'
export const NOTIFICATION_TYPE_WARNING = 'NOTIFICATION_TYPE_WARNING'
export const PASSWORD_MISMATCH = 'PASSWORD_MISMATCH'
export const SAVE_ACTION_SAVE_AND_GO_BACK = 'SAVE_ACTION_SAVE_AND_GO_BACK'
export const SAVE_ACTION_SAVE_AND_CONTINUE = 'SAVE_ACTION_SAVE_AND_CONTINUE'
export const SAVE_ACTION_SAVE_AND_CREATE_NEW = 'SAVE_ACTION_SAVE_AND_CREATE_NEW'
export const SAVE_ACTION_SAVE_AS_DUPLICATE = 'SAVE_ACTION_SAVE_AS_DUPLICATE'
export const STATUS_COMPLETE = 'STATUS_COMPLETE'
export const STATUS_DELETING = 'STATUS_DELETING'
export const STATUS_FAILED = 'STATUS_FAILED'
export const STATUS_IDLE = 'STATUS_IDLE'
export const STATUS_LOADED = 'STATUS_LOADED'
export const STATUS_LOADING = 'STATUS_LOADING'
export const STATUS_NOT_FOUND = 'STATUS_NOT_FOUND'
export const STATUS_SAVING = 'STATUS_SAVING'
