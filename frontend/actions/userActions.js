import * as Types from 'actions/actionTypes'

export function setRemoteUser(user) {
  return {
    type: Types.SET_REMOTE_USER,
    user
  }
}

export function updateLocalUser(data) {
  return {
    type: Types.UPDATE_LOCAL_USER,
    data
  }
}

export function signOut() {
  return {
    type: Types.SIGN_OUT
  }
}
