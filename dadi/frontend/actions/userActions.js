import * as types from './actionTypes'

export function signIn (username, signedIn) {
  return {
    type: types.SIGN_IN,
    username,
    signedIn
  }
}

export function signOut () {
  return {
    type: types.SIGN_OUT
  }
}
