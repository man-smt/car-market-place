import { gql } from '@apollo/client'

import { PROPERTIES } from './Fragments'

export const SIGNUP = gql`
  mutation SignUp($input: UserSignUpInput) {
    signUp(input: $input)
  }
`

export const SIGNIN = gql`
  mutation SignIn($input: UserSignInInput) {
    First: signIn(input: $input) {
      ...properties
    }
  }
  ${PROPERTIES}
`

export const ADD_FAVORITE = gql`
  mutation addFavorite($input: FavoriteInput) {
    addFavorite(input: $input) {
      modelID
      elementID
    }
  }
`