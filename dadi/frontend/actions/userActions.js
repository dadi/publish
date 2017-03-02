import * as types from 'actions/actionTypes'

export function signIn(user) {
  return {
    type: types.SIGN_IN,
    user
  }
}

export function signOut() {
  return {
    type: types.SIGN_OUT
  }
}
