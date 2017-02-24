import * as types from 'actions/actionTypes'

export function signIn (email, signedIn) {
  return {
    type: types.SIGN_IN,
    email,
    signedIn
  }
}

export function signOut () {
  return {
    type: types.SIGN_OUT
  }
}
