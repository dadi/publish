import * as Constants from 'lib/constants'
import * as Cookies from 'js-cookie'
import * as Types from 'actions/actionTypes'

const initialState = {
  accessToken: Cookies.get('accessToken'),
  accessTokenExpiry: parseInt(Cookies.get('accessTokenExpiry')),
  isAuthenticating: false,
  isSaving: false,
  isSignedIn: Boolean(window.__client__),
  local: {},
  remote: flattenUser(window.__client__) || {},
  remoteError: null,
  saveAttempts: 0,
  sessionHasExpired: false,
  validationErrors: null
}

function flattenUser(user) {
  const {data = {}} = user || {}
  const flattenedData = Object.keys(data).reduce((flatData, key) => {
    flatData[`data.${key}`] = data[key]

    return flatData
  }, {})

  return {
    ...user,
    ...flattenedData,
    data: undefined
  }
}

function signOut(action) {
  Cookies.remove('accessToken')
  Cookies.remove('accessTokenExpiry')

  return {
    ...initialState,
    accessToken: undefined,
    isSaving: false,
    isSignedIn: false,
    sessionHasExpired: Boolean(action.sessionHasExpired)
  }
}

export default function user(state = initialState, action = {}) {
  switch (action.type) {
    case Types.ATTEMPT_SAVE_USER:
      return {
        ...state,
        saveAttempts: state.saveAttempts + 1
      }

    case Types.AUTHENTICATE:
      let {accessToken, accessTokenTTL, client} = action
      let expiryTimestamp = Date.now() + accessTokenTTL * 1000
      let expiryDate = new Date(expiryTimestamp)

      Cookies.set('accessToken', accessToken, {
        expires: expiryDate
      })

      Cookies.set('accessTokenExpiry', expiryTimestamp, {
        expires: expiryDate
      })

      return {
        ...state,
        accessToken,
        accessTokenExpiry: expiryTimestamp,
        failedSignInAttempts: 0,
        isSignedIn: true,
        remote: client,
        sessionHasExpired: false
      }

    case Types.REGISTER_NETWORK_ERROR:
      // We're interested in processing errors with the code API-0005 only, as
      // those signal an authentication error (i.e. the access token stored is
      // no longer valid). If that's not the error we're seeing here, there's
      // nothing for us to do. If it is, we return the result of `signOut()`.
      if (
        !action.error ||
        !action.error.code ||
        action.error.code !== Constants.API_UNAUTHORISED_ERROR
      ) {
        return state
      }

      return signOut(action)

    case Types.SET_API_STATUS:
      if (action.error === Constants.API_UNAUTHORISED_ERROR) {
        Cookies.remove('accessToken')
        Cookies.remove('accessTokenExpiry')

        return {
          ...initialState,
          accessToken: undefined,
          isSignedIn: false
        }
      }

      return state

    case Types.SET_REMOTE_USER:
      return {
        ...state,
        isSaving: false,
        isSignedIn: true,
        local: {},
        remote: flattenUser(action.user),
        remoteError: null
      }

    case Types.SET_USER_STATUS:
      switch (action.status) {
        case Constants.STATUS_LOADING:
          return {
            ...state,
            isAuthenticating: true,
            sessionHasExpired: false
          }

        case Constants.STATUS_SAVING:
          return {
            ...state,
            isSaving: true,
            sessionHasExpired: false
          }

        case Constants.STATUS_FAILED:
          return {
            ...state,
            isAuthenticating: false,
            isSaving: false,
            remoteError: action.data,
            sessionHasExpired: false
          }
      }

      return state

    case Types.SIGN_OUT:
      return signOut(action)

    case Types.UPDATE_LOCAL_USER:
      const errorUpdate = Object.keys(action.update).reduce((errors, field) => {
        errors[field] = action.error[field]

        return errors
      }, {})

      return {
        ...state,
        local: {
          ...state.local,
          ...action.update
        },
        validationErrors: {
          ...state.validationErrors,
          ...errorUpdate
        }
      }

    default:
      return state
  }
}
