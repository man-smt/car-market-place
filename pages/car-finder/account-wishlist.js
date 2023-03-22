import { useContext, useState } from 'react'
import CarFinderPageLayout from '../../components/partials/CarFinderPageLayout'
import CarFinderAccountLayout from '../../components/partials/CarFinderAccountLayout'
import Link from 'next/link'
import Button from 'react-bootstrap/Button'
import VehicleCard from '../../components/VehicleCard'
import { useQuery } from '@apollo/client'
import { FAVORITES, PRODUCTS } from '../../graphql/Queries'
import NotFoundPage from './404-not-found'
import { isEmpty } from 'lodash'
import client from '../../apollo'
import { AppContext } from '../../provider/AppContext'
import { Spinner } from 'react-bootstrap'

const AccountWishlistPage = () => {
  const {
    state: { user },
  } = useContext(AppContext)
  const [items, setItems] = useState([])

  const {
    data: wishListData,
    loading,
    error,
  } = useQuery(FAVORITES, {
    variables: {
      where: { user: { email: { eq: user?.email } } },
    },
    fetchPolicy: 'network-only',
  })

  const clearAll = (e) => {
    e.preventDefault()
    setItems([])
  }

  return (
    <CarFinderPageLayout
      pageTitle='Account Wishlist'
      activeNav='Account'
      userLoggedIn
    >
      {loading ? (
        <Spinner animation='border' role='status' />
      ) : (
        <CarFinderAccountLayout accountPageTitle='Wishlist'>
          <div className='d-flex align-items-center justify-content-between mb-4 pb-2'>
            <h1 className='h2 text-light mb-0'>
              Wishlist
              <span className='badge bg-faded-light fs-base align-middle ms-3'>
                {wishListData?.favorites.totalCount}
              </span>
            </h1>
            <a href='#' className='nav-link-light fw-bold' onClick={clearAll}>
              <i className='fi-x fs-xs mt-n1 me-2'></i>
              Clear all
            </a>
          </div>

          {wishListData?.favorites.totalCount > 0 ? (
            wishListData?.favorites?.items?.map((item, indx) => (
              <VehicleCard
                key={indx}
                href={item.href}
                images={item.img.map((img, indx) => [img, 'Image'])}
                title={item.name}
                year={item.year}
                price={item.price}
                location={item.location}
                checkbox={{
                  label: 'Compare',
                  props: {
                    onChange: (e) =>
                      e.target.checked
                        ? console.log('Car ADDED to comparison list!')
                        : console.log('Car REMOVED from comparison list!'),
                  },
                }}
                badges={item.badges}
                wishlistButton={{
                  tooltip: 'Remove from Wishlist',
                  active: true,
                  props: {
                    'data-index': indx,
                    onClick: (e) => {
                      let index = e.currentTarget.dataset.index
                      let newItems = [...items]
                      if (index !== -1) {
                        newItems.splice(index, 1)
                        setItems(newItems)
                      }
                    },
                  },
                }}
                footer={[
                  ['fi-dashboard', item.productType],
                  ['fi-gearbox', item.releaseStatus],
                ]}
                horizontal
                light
                className='mb-4'
              />
            ))
          ) : (
            // Empty state
            <div className='text-light text-center pt-2 pt-md-4 pt-lg-5 pb-2 pb-md-0'>
              <i className='fi-heart display-6 opacity-50 mb-4'></i>
              <h2 className='h5 text-light mb-2'>Your Wishlist is empty!</h2>
              <p className='opacity-70 pb-1'>
                Search our catalog for relevant cars and add them to you
                Wishlist to buy them later.
              </p>
              <Button as={Link} href='/car-finder/catalog?view=list'>
                Go to Catalog
              </Button>
            </div>
          )}
        </CarFinderAccountLayout>
      )}
    </CarFinderPageLayout>
  )
}

export default AccountWishlistPage
