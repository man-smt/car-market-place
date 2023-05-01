import { useEffect, useReducer, useState } from 'react'
import CarFinderPageLayout from '../../components/partials/CarFinderPageLayout'
import Link from 'next/link'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Form from 'react-bootstrap/Form'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import CloseButton from 'react-bootstrap/CloseButton'
import Pager from 'react-bootstrap/Pagination'
import VehicleCard from '../../components/VehicleCard'
import StarRating from '../../components/StarRating'
import Review from '../../components/Review'
import Avatar from '../../components/Avatar'
import ImageLoader from '../../components/ImageLoader'
import MarketButton from '../../components/MarketButton'
import { Navigation, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useQuery } from '@apollo/client'
import { OFFERS, PRODUCTS, REVIEW } from '../../graphql/Queries'
import NotFoundPage from './404-not-found'
import { Spinner } from 'react-bootstrap'

const VendorPage = () => {
  // Add review modal
  const [modalShow, setModalShow] = useState(false)
  const [reviewFilter, setReviewFilter] = useState({})
  const [rating, setFiveStar] = useState({})
  const handleModalClose = () => setModalShow(false)
  const handleModalShow = () => setModalShow(true)

  // Message form validation
  const [messageValidated, setMessageValidated] = useState(false)
  const [offerFilter, setOfferFilter] = useState({})

  const {
    data: ReviewData,
    loading: ReviewLoading,
    error: ReviewError,
  } = useQuery(REVIEW, {
    variables: { order: reviewFilter, where: {} },
    fetchPolicy: 'network-only',
  })
  const {
    data: offerData,
    loading,
    error,
  } = useQuery(OFFERS, { variables: { order: offerFilter, where: {} } })

  console.log(offerFilter, 'offerFilter')

  const {
    data: carData,
    loading: CarLoading,
    error: CarError,
  } = useQuery(PRODUCTS, {
    variables: { take: 3 },
    fetchPolicy: 'network-only',
  })

  if (error || CarError || ReviewError) return <NotFoundPage />
  useEffect(() => {
    if (!ReviewLoading && !ReviewError) {
      ;[1, 2, 3, 4, 5].map((item) => {
        ratingReview(item)
      })
    }
  }, [ReviewData])

  let cars = []
  if (carData) {
    carData?.products?.items?.map((car) => {
      cars.push({
        ...car,
        img: [
          '/images/car-finder/catalog/14.jpg',
          '/images/car-finder/catalog/14.jpg',
        ],
        href: `/car-finder/${car?.id}`,
      })
    })
  }
  const selectOffer = (e) => {
    if (e.target.value === 'newest') {
      setOfferFilter({ createdOn: 'DESC' })
    }
  }

  const handleMessageSubmit = (event) => {
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    }
    setMessageValidated(true)
  }

  // Add review form validation
  const [reviewValidated, setReviewValidated] = useState(false)
  const handleReviewSubmit = (event) => {
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    }
    setReviewValidated(true)
  }

  const selectReviewFilter = (e) => {
    if (e.target.value === 'Newest') {
      setReviewFilter({ createdOn: 'DESC' })
    } else if (e.target.value === 'Oldest') {
      setReviewFilter({ createdOn: 'ASC' })
    } else if (e.target.value === 'High rating') {
      setReviewFilter({ score: 'DESC' })
    } else if (e.target.value === 'Low rating') {
      setReviewFilter({ score: 'ASC' })
    }
  }

  const ratingReview = (no) => {
    const data = ReviewData?.reviews?.items.filter((item) => item?.score === no)
    const per = (data.length / ReviewData?.reviews?.totalCount) * 100
    setFiveStar((curr) => {
      let obj = {
        ...curr,
      }

      obj[`star${no}`] = per

      return obj
    })
  }

  // Review with actionable Like / Dislike buttons
  const ReviewActionable = ({
    authorImg,
    authorName,
    rating,
    date,
    text,
    likesNum,
    dislikesNum,
    ...props
  }) => {
    const initialState = {
      likes: likesNum,
      dislikes: dislikesNum,
      active: null,
    }

    const reducer = (state, action) => {
      const { likes, dislikes, active } = state

      switch (action.type) {
        case 'likeHandle':
          return {
            ...state,
            likes: state.likes + 1,
            dislikes: active === 'dislike' ? dislikes - 1 : dislikes,
            active: 'like',
          }
        case 'dislikeHandle':
          return {
            ...state,
            dislikes: state.dislikes + 1,
            likes: active === 'like' ? likes - 1 : likes,
            active: 'dislike',
          }
        default:
          return state
      }
    }

    const [state, dispatch] = useReducer(reducer, initialState)
    const { likes, dislikes, active } = state

    return (
      <Review
        light
        author={{
          thumbSrc: authorImg,
          thumbSize: 48,
          thumbShape: 'rounded-circle',
          name: authorName,
        }}
        rating={rating}
        date={date}
        likeActive={active === 'like' ? true : false}
        dislikeActive={active === 'dislike' ? true : false}
        likeCount={likes}
        dislikeCount={dislikes}
        likeClick={() =>
          active !== 'like' ? dispatch({ type: 'likeHandle' }) : null
        }
        dislikeClick={() =>
          active !== 'dislike' ? dispatch({ type: 'dislikeHandle' }) : null
        }
        {...props}
      >
        {text}
      </Review>
    )
  }

  return (
    <CarFinderPageLayout
      pageTitle='Vendor Page'
      activeNav='Vendor'
      userLoggedIn
    >
      {/* Add review modal */}
      <Modal
        centered
        show={modalShow}
        onHide={handleModalClose}
        contentClassName='bg-dark border-light'
      >
        <Modal.Header className='d-block position-relative border-0 pb-0 px-sm-5 px-4'>
          <Modal.Title as='h3' className='mt-4 text-center text-light'>
            Leave a review
          </Modal.Title>
          <CloseButton
            variant='white'
            onClick={handleModalClose}
            aria-label='Close modal'
            className='position-absolute top-0 end-0 mt-3 me-3'
          />
        </Modal.Header>
        <Modal.Body className='px-sm-5 px-4'>
          <Form
            noValidate
            validated={reviewValidated}
            onSubmit={handleReviewSubmit}
          >
            <Form.Group controlId='review-name' className='mb-3'>
              <Form.Label className='text-light'>
                Name <span className='text-danger'>*</span>
              </Form.Label>
              <Form.Control
                className='form-control-light'
                placeholder='Your name'
                required
              />
              <Form.Control.Feedback type='invalid'>
                Please let us know your name.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId='review-email' className='mb-3'>
              <Form.Label className='text-light'>
                Email <span className='text-danger'>*</span>
              </Form.Label>
              <Form.Control
                className='form-control-light'
                type='email'
                placeholder='Your email address'
                required
              />
              <Form.Control.Feedback type='invalid'>
                Please provide a valid email address.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId='review-rating' className='mb-3'>
              <Form.Label className='text-light'>
                Rating <span className='text-danger'>*</span>
              </Form.Label>
              <Form.Select className='form-select-light' required>
                <option value=''>Choose rating</option>
                <option value='5'>5 stars</option>
                <option value='4'>4 stars</option>
                <option value='3'>3 stars</option>
                <option value='2'>2 stars</option>
                <option value='1'>1 star</option>
              </Form.Select>
              <Form.Control.Feedback type='invalid'>
                Please rate the property.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId='review-text' className='mb-4'>
              <Form.Label className='text-light'>
                Review <span className='text-danger'>*</span>
              </Form.Label>
              <Form.Control
                className='form-control-light'
                as='textarea'
                rows={5}
                placeholder='Your review message'
                required
              />
              <Form.Control.Feedback type='invalid'>
                Please write your review.
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              size='lg'
              type='submit'
              variant='primary d-block w-100 mb-4'
            >
              Submit a review
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {loading || ReviewLoading || CarLoading ? (
        <Spinner animation='border' role='status' />
      ) : (
        <Container as='section' className='pt-5 pb-lg-4 my-5'>
          {/* Breadcrumb */}
          <Breadcrumb className='breadcrumb-light mb-4 pt-md-3'>
            <Breadcrumb.Item linkAs={Link} href='/car-finder'>
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item>Sellers</Breadcrumb.Item>
            <Breadcrumb.Item active>Devon Lane</Breadcrumb.Item>
          </Breadcrumb>
          <Row className='gy-5'>
            {/* Content */}
            <Col xs={12} lg={{ span: 8, order: 'last' }}>
              <div className='d-sm-flex align-items-center justify-content-between pb-4 mb-sm-2'>
                <h1 className='h3 text-light mb-sm-0 me-sm-3'>
                  Available car offers
                </h1>
                <Form.Group
                  controlId='cars-sort'
                  className='d-flex align-items-center'
                >
                  <Form.Label className='fs-sm text-light mb-0 me-2 pe-1 text-nowrap'>
                    <i className='fi-arrows-sort mt-n1 me-2'></i>
                    Sort by:
                  </Form.Label>
                  <Form.Select
                    size='sm'
                    className='form-select-light'
                    onChange={selectOffer}
                  >
                    <option value='newest'>Newest</option>
                    <option value='popular'>Popular</option>
                    <option value='priceLH'>Price: Low - High</option>
                    <option value='priceHL'>Price: High - Low</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Items (Cars) */}
              {offerData?.offers?.totalCount > 0 ? (
                cars.map((car, indx) => (
                  <VehicleCard
                    key={indx}
                    href={car.href}
                    images={car.img.map((img, indx) => [img, 'Image'])}
                    title={car.name}
                    year={car.year}
                    price={car.price}
                    location={car.location}
                    // checkbox={{
                    //   label: 'Compare',
                    //   props: {
                    //     onChange: (e) =>
                    //       e.target.checked
                    //         ? console.log('Car ADDED to comparison list!')
                    //         : console.log('Car REMOVED from comparison list!'),
                    //   },
                    // }}
                    badges={car.badges}
                    wishlistButton={{
                      tooltip: 'Add to Wishlist',
                      props: {
                        onClick: () =>
                          console.log('Vehicle added to your Wishlist!'),
                      },
                    }}
                    footer={[
                      ['fi-dashboard', car.productType],
                      ['fi-gearbox', car.releaseStatus],
                    ]}
                    horizontal
                    light
                    className='mb-4'
                  />
                ))
              ) : (
                <div className='text-light text-center pt-2 pt-md-4 pt-lg-5 pb-2 pb-md-0'>
                  <i className='fi-heart display-6 opacity-50 mb-4'></i>
                  <h2 className='h5 text-light mb-2'>Your Offers is empty!</h2>
                  <p className='opacity-70 pb-1'>
                    Search our catalog for relevant cars and add them to you
                    Wishlist to buy them later.
                  </p>
                </div>
              )}

              {/* Reviews */}
              <h2 className='h3 text-light pt-5 pb-2 mt-n3 mt-lg-n1 mb-4'>
                {`Seller reviews (${ReviewData?.reviews?.totalCount})`}
              </h2>
              <div className='d-flex align-items-center text-light mb-2 pb-1'>
                <StarRating rating={5} className='me-3' />
                <ProgressBar
                  variant='warning'
                  now={rating?.star5}
                  className='progress-light w-100'
                />
                <div
                  className='flex-shrink-0 flex-grow-1 fs-sm text-end ps-2'
                  style={{ width: '3rem' }}
                >
                  {`${rating?.star5}%`}
                </div>
              </div>
              <div className='d-flex align-items-center text-light mb-2 pb-1'>
                <StarRating rating={4} className='me-3' />
                <ProgressBar
                  variant='warning'
                  now={rating?.star4}
                  className='progress-light w-100'
                />
                <div
                  className='flex-shrink-0 flex-grow-1 fs-sm text-end ps-2'
                  style={{ width: '3rem' }}
                >
                  {rating?.star4}%
                </div>
              </div>
              <div className='d-flex align-items-center text-light mb-2 pb-1'>
                <StarRating rating={3} className='me-3' />
                <ProgressBar
                  variant='warning'
                  now={rating?.star3}
                  className='progress-light w-100'
                />
                <div
                  className='flex-shrink-0 flex-grow-1 fs-sm text-end ps-2'
                  style={{ width: '3rem' }}
                >
                  {rating?.star3}%
                </div>
              </div>
              <div className='d-flex align-items-center text-light mb-2 pb-1'>
                <StarRating rating={2} className='me-3' />
                <ProgressBar
                  variant='warning'
                  now={rating?.star2}
                  className='progress-light w-100'
                />
                <div
                  className='flex-shrink-0 flex-grow-1 fs-sm text-end ps-2'
                  style={{ width: '3rem' }}
                >
                  {rating?.star2}%
                </div>
              </div>
              <div className='d-flex align-items-center text-light mb-2 pb-1'>
                <StarRating rating={1} className='me-3' />
                <ProgressBar
                  variant='warning'
                  now={rating?.star1}
                  className='progress-light w-100'
                />
                <div
                  className='flex-shrink-0 flex-grow-1 fs-sm text-end ps-2'
                  style={{ width: '3rem' }}
                >
                  {rating?.star1}%
                </div>
              </div>

              {/* Add review btn + Reviews sort */}
              <div className='d-flex flex-sm-row flex-column align-items-sm-center justify-content-between py-4 mt-3 mb-4 border-bottom border-light'>
                <Form.Group
                  controlId='reviews-sort'
                  className='d-flex align-items-center mb-sm-0 mb-3'
                >
                  <Form.Label className='text-light mb-0 me-2 pe-1 text-nowrap'>
                    <i className='fi-arrows-sort mt-n1 me-2'></i>
                    Sort by:
                  </Form.Label>
                  <Form.Select
                    className='form-select-light'
                    onChange={selectReviewFilter}
                  >
                    <option value='Newest'>Newest</option>
                    <option value='Oldest'>Oldest</option>
                    <option value='Popular'>Popular</option>
                    <option value='High rating'>High rating</option>
                    <option value='Low rating'>Low rating</option>
                  </Form.Select>
                </Form.Group>
                <Button variant='primary ms-sm-4' onClick={handleModalShow}>
                  <i className='fi-edit mt-n1 me-1 align-middle'></i>
                  Add review
                </Button>
              </div>
              {/* Reviews list */}
              {ReviewData?.reviews?.items.map((review, indx) => (
                <ReviewActionable
                  key={indx}
                  // authorName={review.user.name}
                  rating={review.score}
                  date={new Date(review.createdOn)
                    .toString()
                    .split(' ')
                    .splice(1, 3)
                    .join('-')}
                  text={review.content}
                  likesNum={review.likesNum}
                  dislikesNum={review.dislikesNum}
                  className='mb-4 pb-4 border-bottom border-light'
                />
              ))}

              {/* Pagination */}
              <nav
                className='pagination-light mt-2'
                aria-label='Reviews pagination'
              >
                <Pager className='mb-4 mb-sm-0'>
                  <Pager.Item active>{1}</Pager.Item>
                  <Pager.Item>{2}</Pager.Item>
                  <Pager.Item>{3}</Pager.Item>
                  <Pager.Ellipsis />
                  <Pager.Item>{8}</Pager.Item>
                  <Pager.Item>
                    <i className='fi-chevron-right'></i>
                  </Pager.Item>
                </Pager>
              </nav>
            </Col>

            {/* Sidebar */}
            <Col
              xs={12}
              lg={{ span: 4, order: 'first' }}
              as='aside'
              className='pe-xl-4'
            >
              <div className='d-flex align-items-start mb-4'>
                <Avatar
                  img={{ src: '/images/avatars/34.jpg', alt: 'Devon Lane' }}
                  size={[72, 72]}
                />
                <div className='ps-2'>
                  <h2 className='h4 text-light mb-1'>Devon Lane</h2>
                  <p className='d-flex align-items-center text-light opacity-70'>
                    <i className='fi-map-pin me-1'></i>
                    <span>Chicago, IL 60603</span>
                  </p>
                  <div className='d-flex mt-n2 ms-n2'>
                    <Button
                      size='xs'
                      variant='translucent-light btn-icon rounded-circle'
                      className='mt-2 ms-2'
                    >
                      <i className='fi-whatsapp'></i>
                    </Button>
                    <Button
                      size='xs'
                      variant='translucent-light btn-icon rounded-circle'
                      className='mt-2 ms-2'
                    >
                      <i className='fi-messenger'></i>
                    </Button>
                    <Button
                      size='xs'
                      variant='translucent-light btn-icon rounded-circle'
                      className='mt-2 ms-2'
                    >
                      <i className='fi-viber'></i>
                    </Button>
                  </div>
                </div>
              </div>
              <ul className='list-unstyled text-light py-2 mb-3'>
                <li>
                  <strong>Available car offers: </strong>
                  <span className='opacity-70'>
                    {offerData?.offers?.totalCount}
                  </span>
                </li>
                <li>
                  <strong>Cars certified: </strong>
                  <span className='opacity-70'>1</span>
                </li>
                <li>
                  <strong>Cars sold: </strong>
                  <span className='opacity-70'>2</span>
                </li>
              </ul>
              <Button size='lg' variant='outline-light' className='px-4 mb-4'>
                <i className='fi-phone me-2'></i>
                (316) *** **** &mdash; reveal
              </Button>

              {/* Form message */}
              <Form
                noValidate
                validated={messageValidated}
                onSubmit={handleMessageSubmit}
                className='pt-2 pb-4 mb-3'
              >
                <Form.Group className='mb-3'>
                  <Form.Control
                    className='form-control-light'
                    placeholder='Name*'
                    required
                  />
                  <Form.Control.Feedback type='invalid'>
                    Please enter your name.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Control
                    type='email'
                    className='form-control-light'
                    placeholder='Email*'
                    required
                  />
                  <Form.Control.Feedback type='invalid'>
                    Provide a valid email address.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Control
                    type='tel'
                    className='form-control-light'
                    placeholder='Phone'
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Control
                    as='textarea'
                    rows={4}
                    className='form-control-light'
                    placeholder='Message*'
                    required
                  />
                  <Form.Control.Feedback type='invalid'>
                    Write your message.
                  </Form.Control.Feedback>
                </Form.Group>
                <Button type='submit' size='lg' variant='primary'>
                  <i className='fi-send me-2'></i>
                  Send message
                </Button>
              </Form>

              {/* Promo */}
              <div className='card card-light card-body pb-0 overflow-hidden'>
                <h3 className='h4 text-light pt-1'>Get our top-rated app!</h3>
                <p className='text-light opacity-70 mb-4'>
                  Don&apos;t stop your car search when you leave your computer
                  with our Android and iOS app!
                </p>
                <div className='d-flex align-items-start pt-2'>
                  <div
                    className='d-flex w-100 me-1'
                    style={{ maxWidth: '185px' }}
                  >
                    <ImageLoader
                      src='/images/car-finder/home/mobile-app-sm.png'
                      width={185}
                      height={253}
                      alt='Mobile App'
                      light='true'
                    />
                  </div>
                  <div
                    className='flex-shrink-0 ps-3'
                    style={{ minWidth: '145px' }}
                  >
                    <MarketButton
                      href='#'
                      market='apple'
                      className='w-100 mb-3'
                    />
                    <br />
                    <MarketButton href='#' market='google' className='w-100' />
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Related posts (Carousel) */}
          <h2 className='h3 text-light pt-5 pb-3 mt-md-4'>
            You may be interested in
          </h2>
          <div className='position-relative'>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                prevEl: '#prev',
                nextEl: '#next',
              }}
              pagination={{
                el: '#pagination',
                clickable: true,
              }}
              loop
              spaceBetween={24}
              breakpoints={{
                0: { slidesPerView: 1 },
                500: { slidesPerView: 2 },
                850: { slidesPerView: 3 },
              }}
            >
              {cars.map((car, indx) => (
                <SwiperSlide key={indx} className='h-auto'>
                  <VehicleCard
                    href={car.href}
                    images={[[car.img[0], 473, 242, 'Image']]}
                    title={car.name}
                    year={car.year}
                    price={car.price}
                    location={car.location}
                    // checkbox={{
                    //   label: 'Compare',
                    //   props: {
                    //     onChange: (e) =>
                    //       e.target.checked
                    //         ? console.log('Car ADDED to comparison list!')
                    //         : console.log('Car REMOVED from comparison list!'),
                    //   },
                    // }}
                    badges={car.badges}
                    wishlistButton={{
                      tooltip: 'Add to Wishlist',
                      props: {
                        onClick: () =>
                          console.log('Vehicle added to your Wishlist!'),
                      },
                    }}
                    footer={[
                      ['fi-dashboard', car.productType],
                      ['fi-gearbox', car.releaseStatus],
                    ]}
                    light
                    className='h-100'
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* External Prev/Next buttons */}
            <Button
              id='prev'
              variant='prev btn-light'
              className='d-none d-xxl-block mt-n5 ms-n5'
            />
            <Button
              id='next'
              variant='next btn-light'
              className='d-none d-xxl-block mt-n5 me-n5'
            />
          </div>

          {/* External pagination (bullets) buttons */}
          <div
            id='pagination'
            className='swiper-pagination swiper-pagination-light position-relative bottom-0 pt-2 mt-4 pb-4 pb-sm-3'
          ></div>
        </Container>
      )}
    </CarFinderPageLayout>
  )
}

export default VendorPage
