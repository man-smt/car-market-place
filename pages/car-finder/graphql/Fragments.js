import { gql } from '@apollo/client'

export const PROPERTIES = gql`
  fragment properties on Token {
    accessToken
    refreshToken
    expiresOn
  }
`