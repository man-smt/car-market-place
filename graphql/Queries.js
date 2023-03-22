import { gql } from '@apollo/client'

export const PRODUCTS = gql`
  query products(
    $order: [ProductSortInput!]
    $skip: Int
    $take: Int
    $where: ProductFilterInput
  ) {
    products(order: $order, skip: $skip, take: $take, where: $where) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      items {
        brandID
        model
        sku
        gtin
        barcode
        manual
        video
        warranty
        guarantee
        height
        length
        slug
        summary
        serial
        productType
        content
        name
        advertises {
          condition
          title
          content
          requirement
          video
          price
          hidden
          prices {
            advertiseID
            amount
          }
        }
        brand {
          categoryID
          id
          deletedOn
          modifiedOn
          createdOn
          name
          slug
          icon
          sorting
          top
          category {
            model {
              name
            }
            modelID
            slug
            description
            code
            icon
            svg
            pageSize
            regex
            sorting
            popular
            home
            menu
            active
            # organizationID
            # ownerID
            parentID
            userID
            id
            deletedOn
            modifiedOn
            createdOn
            correlationID
            name
            title
            country {
              continentID
              latitude
              longitude
              sorting
              active
              name
            }
            model {
              moduleID
              createdOn
              module {
                name
                modifiedOn
                createdOn
                description
                icon
                svg
                sorting
                hidden
                id
                deletedOn
              }
              name
              description
              id
              deletedOn
              modifiedOn
              categories {
                modelID
                model {
                  name
                }
                slug
                description
                code
                icon
                svg
                regex
                pageSize
                sorting
                top
                popular
                home
                menu
              }
              id
            }
          }
        }
        height
        length
        width
        msrp
        active
        featured
        highlighted
        manufacturerID
        ownerID
        userID
        id
        deletedOn
        modifiedOn
        createdOn
        productType
        releaseStatus
        owner {
          name
          userInteractions {
            interactionID
          }
        }
        user {
          name
        }
        manufacturer {
          name
          user {
            name
            # departments {
            #   companyID
            # }
          }
          approvedOn
          website
        }
        seoConfiguration {
          title
          ogDescription
          image
          seoType
        }
        productSpecifications {
          productID
          id
          product {
            manufacturerID
          }
          type
          description
          specificationValueID
          specificationValue {
            rgb
            code
            color {
              modelID
              model {
                name
              }
              name
              model {
                moduleID
                module {
                  name
                }
                categories {
                  popular
                  country {
                    continentID
                    name
                    iso2
                    iso3
                  }
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`

export const SPECIFICATIONS = gql`
  query specifications(
    $order: [SpecificationSortInput!]
    $skip: Int
    $take: Int
    $where: SpecificationFilterInput
  ) {
    specifications(order: $order, skip: $skip, take: $take, where: $where) {
      items {
        id
        name
        slug
        specificationValues {
          id
          name
          slug
        }
      }
    }
  }
`

export const FAVORITES = gql`
  query favorites(
    $order: [FavoriteSortInput!]
    $skip: Int
    $take: Int
    $where: FavoriteFilterInput
  ) {
    favorites(order: $order, skip: $skip, take: $take, where: $where) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        __typename
      }
      totalCount
      items {
        id
        modelID
        createdOn
        ownerID
        userID
        deletedOn
        modifiedOn
        owner {
          name
        }
        user {
          name
        }
        model {
          moduleID
          name
          createdOn
          __typename
          description
          categories {
            slug
            description
            svg
            popular
            correlationID
            seoConfiguration {
              title
              ogDescription
              twitterHandle
              twitterCardType
              websiteName
              websiteUrl
              canonicalUrl
              image
            }
          }
        }
      }
    }
  }
`

export const OFFERS = gql`
  query offers(
    $order: [OfferSortInput!]
    $skip: Int
    $take: Int
    $where: OfferFilterInput
  ) {
    offers(order: $order, skip: $skip, take: $take, where: $where) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      items {
        storeID
        startsOn
        expiresOn
        ownerID
        userID
        user {
          name
        }
        owner {
          name
        }
        id
        deletedOn
        modifiedOn
        createdOn
        store {
          storeType
          verified
          approvedOn
          verifiedOn
          approved
          email
          name
        }
        createdOn
        expired
        amount
        currency {
          name
          id
        }
        serviceID
        companyID
      }
    }
  }
`

export const GET_LOGIN_USER = gql`
  query user($id: UUID) {
    user(id: $id) {
      name
      slug
      prefix
      email
      password
    }
  }
`

export const ISSUER = gql`
  query issue {
    issue {
      issuer
      accessToken
      refreshToken
      expiresOn
      __typename
    }
  }
`

export const REVIEW = gql`
  query reviews(
    $order: [ReviewSortInput!]
    $skip: Int
    $take: Int
    $where: ReviewFilterInput
  ) {
    reviews(order: $order, skip: $skip, take: $take, where: $where) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        __typename
      }
      totalCount
      items {
        modelID
        model {
          name
        }
        content
        countryID
        userID
        createdOn
        modifiedOn
        statusID
        score
        id
        deletedOn
        user {
          name
        }
      }
    }
  }
`

export const ADVERTISES = gql`
  query advertises(
    $order: [AdvertiseSortInput!]
    $skip: Int
    $take: Int
    $where: AdvertiseFilterInput
  ) {
    advertises(order: $order, skip: $skip, take: $take, where: $where) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      items {
        condition
        advertiseGroup
        title
        content
        startsOn
        expiresOn
        cancelledOn
        country {
          name
          slug
        }
        user {
          name
          surname
          specificationValues {
            slug
            name
            specification {
              name
              slug
            }
          }
        }
        id
        createdOn
        locationSpecifications {
          locationValue {
            name
            slug
            capital
            postcode
            country {
              name
              slug
              id
            }
            location {
              name
              slug
            }
          }
        }
        prices {
          amount
          specificationValue {
            specification {
              name
              slug
            }
            name
            slug
          }
        }
        currency {
          name
          slug
          symbol
          rate
        }
        productID
        product {
          id
          brand {
            category {
              modelID
              model {
                name
              }
            }
          }
          deletedOn
          modifiedOn
          createdOn
          productType
          releaseStatus
          productSpecifications {
            specificationValue {
              specification {
                name
                slug
                active
                limited
                required
                highlighted
                sorting
              }
              name
              slug
              image
            }
          }
          name
          slug
          manual
          user {
            name
            slug
          }
          userID
          ownerID
        }
        advertiseSpecifications {
          advertiseID
          specificationValue {
            name
            slug
            image
            specification {
              name
              slug
            }
          }
        }
      }
    }
  }
`

export const ADVERTISE = gql`
  query advertise($id: UUID) {
    advertise(id: $id) {
      condition
      advertiseGroup
      title
      content
      startsOn
      expiresOn
      cancelledOn
      country {
        name
        slug
      }
      user {
        name
        surname
        specificationValues {
          slug
          name
          specification {
            name
            slug
          }
        }
      }
      id
      createdOn
      locationSpecifications {
        locationValue {
          name
          slug
          capital
          postcode
          country {
            name
            slug
            id
          }
          location {
            name
            slug
          }
        }
      }
      prices {
        amount
        specificationValue {
          specification {
            name
            slug
          }
          name
          slug
        }
      }
      currency {
        name
        slug
        symbol
        rate
      }
      productID
      product {
        id
        brand {
          category {
            modelID
            model {
              name
            }
          }
        }
        deletedOn
        modifiedOn
        createdOn
        productType
        releaseStatus
        productSpecifications {
          specificationValue {
            specification {
              name
              slug
              active
              limited
              required
              highlighted
              sorting
            }
            name
            slug
            image
          }
        }
        name
        slug
        manual
        user {
          name
          slug
        }
        userID
        ownerID
      }
      advertiseSpecifications {
        advertiseID
        specificationValue {
          name
          slug
          image
          specification {
            name
            slug
          }
        }
      }
    }
  }
`

export const COUNTRIES = gql`
  query countries(
    $order: [CountrySortInput!]
    $skip: Int
    $take: Int
    $where: CountryFilterInput
  ) {
    countries(order: $order, skip: $skip, take: $take, where: $where) {
      totalCount
      items {
        id
        name
        slug
      }
    }
  }
`

export const BRANDS = gql`
  query brands(
    $order: [BrandSortInput!]
    $skip: Int
    $take: Int
    $where: BrandFilterInput
  ) {
    brands(order: $order, skip: $skip, take: $take, where: $where) {
      totalCount
      items {
        name
        slug
        id
      }
    }
  }
`
