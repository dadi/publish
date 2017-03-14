import * as Types from 'actions/actionTypes'

export function signIn(user) {
  return {
    type: Types.SIGN_IN,
    user
  }
}

export function signOut() {
  return {
    type: Types.SIGN_OUT
  }
}
