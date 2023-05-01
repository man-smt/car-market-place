import { useState } from 'react'
import CarFinderPageLayout from '../../components/partials/CarFinderPageLayout'
import Link from 'next/link'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Tooltip from 'react-bootstrap/Tooltip'
import Badge from 'react-bootstrap/Badge'
import Dropdown from 'react-bootstrap/Dropdown'
import Collapse from 'react-bootstrap/Collapse'
import Accordion from 'react-bootstrap/Accordion'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import ImageLoader from '../../components/ImageLoader'
import Avatar from '../../components/Avatar'
import StarRating from '../../components/StarRating'
import FormGroup from '../../components/FormGroup'
import VehicleCard from '../../components/VehicleCard'
import LightGallery from 'lightgallery/react'
import lgVideo from 'lightgallery/plugins/video'
import { Navigation, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-video.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useQuery } from '@apollo/client'
import { ADVERTISE, PRODUCTS } from '../../graphql/Queries'
import { useRouter } from 'next/router'
import NotFoundPage from './404-not-found'
import { sumBy } from 'lodash'
import SignUpModalDark from '../../components/partials/SignUpModalDark'
import SignInModalDark from '../../components/partials/SignInModalDark'
import client from '../../apollo'
import { ADD_FAVORITE } from '../../graphql/Mutations'
import { Alert, Spinner } from 'react-bootstrap'

const SingleItemPage = () => {
  const router = useRouter()
  const { single } = router?.query
  console.log(single, '===single')
  // Seller's description collapse state
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [modelShow, setModelShow] = useState(false)
  const [signupShow, setSignupShow] = useState(false)
  const [addShow, setAddShow] = useState(false)

  // Message collapse state
  const [messageOpen, setMessageOpen] = useState(false)

  // Form validation
  const [validated, setValidated] = useState(false)
  const handleSubmit = (event) => {
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    }
    setValidated(true)
  }

  const {
    data: advertiseData,
    loading: advertiseLoading,
    error: advertiseError,
  } = useQuery(ADVERTISE, { variables: { id: single } })

  const {
    data: cars,
    loading: CarLoading,
    error: CarError,
  } = useQuery(PRODUCTS, {
    variables: { take: 15 },
    fetchPolicy: 'network-only',
  })

  if (CarError || advertiseError) return <NotFoundPage />

  let carsData = []
  if (cars) {
    cars?.products?.items?.map((car) => {
      carsData.push({
        ...car,
        img: '/images/car-finder/catalog/14.jpg',
        href: `/car-finder/${car?.id}`,
      })
    })
  }

  const closeModel = () => setModelShow(false)
  const closeSignUpModel = () => setSignupShow(false)

  const handleSignInToUp = (e) => {
    e.preventDefault()
    setModelShow(false)
    setSignupShow(true)
  }
  const handleSignUpToIn = (e) => {
    e.preventDefault()
    setModelShow(true)
    setSignupShow(false)
  }

  const addToWishlist = (carData) => {
    let favoriteDataObj = {
      createdOn: carData?.product?.createdOn,
      modelID: carData?.product?.brand?.category?.modelID,
    }
    client
      .mutate({ mutation: ADD_FAVORITE, variables: { input: favoriteDataObj } })
      .then((res) => {
        console.log(res.data)
        router.push('/car-finder/account-wishlist')
      })
      .catch((err) => {
        setAddShow(true)
        console.log(err?.networkError?.result?.errors)
      })
  }

  // Gallery component (Swiper slider with custom thumbnails and slides count)
  const SwiperGallery = () => {
    const [currentSlide, setCurrentSlide] = useState()
    const [totalSlides, setTotalSlides] = useState()

    const thumbnails = [
      '/images/car-finder/single/gallery/th01.jpg',
      '/images/car-finder/single/gallery/th02.jpg',
      '/images/car-finder/single/gallery/th03.jpg',
      '/images/car-finder/single/gallery/th04.jpg',
      '/images/car-finder/single/gallery/th05.jpg',
      '/images/car-finder/single/gallery/th06.jpg',
      '/images/car-finder/single/gallery/th07.jpg',
      '/images/car-finder/single/gallery/th08.jpg',
    ]

    const SlidesCount = () => (
      <div className='swiper-slides-count text-light'>
        <i className='fi-image fs-lg me-2'></i>
        <div className='fs-5 fw-bold ps-1'>
          <span>{currentSlide}</span>
          <span>/</span>
          <span>{totalSlides}</span>
        </div>
      </div>
    )

    return (
      <>
        <Swiper
          modules={[Navigation, Pagination]}
          onSlideChange={(swiper) => {
            setCurrentSlide(swiper.realIndex + 1)
          }}
          onInit={(swiper) => {
            setCurrentSlide(swiper.realIndex + 1)
            setTotalSlides(swiper.slides.length - 2)
          }}
          pagination={{
            el: '.swiper-thumbnails',
            clickable: true,
            renderBullet: (index, className) => {
              return `<li class='swiper-thumbnail ${className}'>
                <img src='${thumbnails[index]}' alt='Thumbnail'>
              </li>`
            },
          }}
          navigation
          spaceBetween={12}
          loop
          grabCursor
          className='swiper-nav-onhover rounded-3'
        >
          <SwiperSlide className='d-flex'>
            <ImageLoader
              light='true'
              className='rounded-3'
              src='/images/car-finder/single/gallery/01.jpg'
              width={746}
              height={420}
              alt='Image'
            />
          </SwiperSlide>
          <SwiperSlide className='d-flex'>
            <ImageLoader
              light='true'
              className='rounded-3'
              src='/images/car-finder/single/gallery/02.jpg'
              width={746}
              height={420}
              alt='Image'
            />
          </SwiperSlide>
          <SwiperSlide className='d-flex'>
            <ImageLoader
              light='true'
              className='rounded-3'
              src='/images/car-finder/single/gallery/03.jpg'
              width={746}
              height={420}
              alt='Image'
            />
          </SwiperSlide>
          <SwiperSlide className='d-flex'>
            <ImageLoader
              light='true'
              className='rounded-3'
              src='/images/car-finder/single/gallery/04.jpg'
              width={746}
              height={420}
              alt='Image'
            />
          </SwiperSlide>
          <SwiperSlide className='d-flex'>
            <ImageLoader
              light='true'
              className='rounded-3'
              src='/images/car-finder/single/gallery/05.jpg'
              width={746}
              height={420}
              alt='Image'
            />
          </SwiperSlide>
          <SwiperSlide className='d-flex'>
            <ImageLoader
              light='true'
              className='rounded-3'
              src='/images/car-finder/single/gallery/06.jpg'
              width={746}
              height={420}
              alt='Image'
            />
          </SwiperSlide>
          <SwiperSlide className='d-flex'>
            <ImageLoader
              light='true'
              className='rounded-3'
              src='/images/car-finder/single/gallery/07.jpg'
              width={746}
              height={420}
              alt='Image'
            />
          </SwiperSlide>
          <SwiperSlide className='d-flex'>
            <ImageLoader
              light='true'
              className='rounded-3'
              src='/images/car-finder/single/gallery/08.jpg'
              width={746}
              height={420}
              alt='Image'
            />
          </SwiperSlide>
          <SlidesCount />
        </Swiper>
        <ul className='swiper-thumbnails'></ul>
        <LightGallery
          licenseKey='D4194FDD-48924833-A54AECA3-D6F8E646'
          plugins={[lgVideo]}
          zoomFromOrigin={false}
          elementClassNames='pb-3'
        >
          <a
            href='https://www.youtube.com/watch?v=0ffN2hgKzOE'
            className='d-flex flex-column align-items-center justify-content-center bg-faded-light rounded text-light text-decoration-none py-4 mt-n3'
          >
            <i className='fi-play-circle fs-5'></i>
            <span className='opacity-70 mt-1'>Play video</span>
          </a>
        </LightGallery>
      </>
    )
  }

  return (
    <CarFinderPageLayout pageTitle='Car Single Page' activeNav='Catalog'>
      {advertiseLoading || CarLoading ? (
        <Spinner animation='border' role='status' />
      ) : (
        <Container className='mt-5 mb-md-4 py-5'>
          {/* Breadcrumb */}
          <Breadcrumb className='breadcrumb-light mb-3 pt-md-3'>
            <Breadcrumb.Item linkAs={Link} href='/car-finder'>
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} href='/car-finder/catalog'>
              Used cars
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              {`${advertiseData?.advertise?.product?.productSpecifications[1]?.specificationValue?.name} ${advertiseData?.advertise?.product?.productSpecifications[0]?.specificationValue?.name}`}
            </Breadcrumb.Item>
          </Breadcrumb>

          {addShow && (
            <Alert variant={'danger'}>
              <p className='mb-0'>Something Went Wrong !</p>
            </Alert>
          )}
          {/* Title + Sharing */}
          <div
            className='d-sm-flex align-items-end align-items-md-center justify-content-between position-relative mb-4'
            style={{ zIndex: 1025 }}
          >
            <div className='me-3'>
              <h1 className='h2 text-light mb-md-0'>
                {`${advertiseData?.advertise?.product?.productSpecifications[1]?.specificationValue?.name} ${advertiseData?.advertise?.product?.productSpecifications[0]?.specificationValue?.name}`}
              </h1>

              {/* Price and badges visible on screens <768 */}
              <div className='d-md-none'>
                <div className='d-flex align-items-center mb-3'>
                  <div className='h3 mb-0 text-light'>{`${
                    advertiseData?.advertise?.currency?.symbol
                  } ${sumBy(advertiseData?.advertise?.prices, 'amount')}`}</div>
                  <div className='text-nowrap ps-3'>
                    <Badge bg='info' className='fs-base me-2'>
                      Used
                    </Badge>
                    <OverlayTrigger
                      trigger={['hover', 'focus']}
                      placement='bottom'
                      overlay={
                        <Popover>
                          <Popover.Body>
                            <div className='d-flex'>
                              <i className='fi-award mt-1 me-2'></i>
                              <span>
                                This car is checked and
                                <br />
                                certified by Finder.
                              </span>
                            </div>
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <Badge bg='success' className='fs-base me-2'>
                        Certified
                      </Badge>
                    </OverlayTrigger>
                  </div>
                </div>
                <div className='d-flex flex-wrap align-items-center text-light mb-2'>
                  <div className='text-nowrap border-end border-light pe-3 me-3'>
                    <i className='fi-dashboard fs-lg opacity-70 me-2'></i>
                    <span className='align-middle'>25K miles</span>
                  </div>
                  <div className='text-nowrap'>
                    <i className='fi-map-pin fs-lg opacity-70 me-2'></i>
                    <span className='align-middle'>Chicago, IL 60603</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wishlist + Share buttons */}
            <div className='text-nowrap pt-3 pt-sm-0'>
              <OverlayTrigger
                placement='top'
                overlay={<Tooltip>Add to Wishlist</Tooltip>}
              >
                <Button
                  size='xs'
                  variant='icon btn-translucent-light shadow-sm rounded-circle mb-sm-2'
                  onClick={() => {
                    const token = localStorage.getItem('token')
                    if (!token) {
                      setModelShow(true)
                    } else {
                      addToWishlist(advertiseData)
                    }
                  }}
                >
                  <i className='fi-heart'></i>
                </Button>
              </OverlayTrigger>
              <Dropdown className='d-inline-block'>
                <OverlayTrigger
                  placement='top'
                  overlay={<Tooltip>Share</Tooltip>}
                >
                  <Dropdown.Toggle variant='icon btn-translucent-light btn-xs shadow-sm rounded-circle ms-2 mb-sm-2'>
                    <i className='fi-share'></i>
                  </Dropdown.Toggle>
                </OverlayTrigger>
                <Dropdown.Menu variant='dark' align='end' className='my-1'>
                  <Dropdown.Item as='button'>
                    <i className='fi-facebook fs-base me-2'></i>
                    Facebook
                  </Dropdown.Item>
                  <Dropdown.Item as='button'>
                    <i className='fi-twitter fs-base me-2'></i>
                    Twitter
                  </Dropdown.Item>
                  <Dropdown.Item as='button'>
                    <i className='fi-instagram fs-base me-2'></i>
                    Instagram
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          <Row>
            <Col md={7}>
              {/* Gallery */}
              <SwiperGallery />
              {/* Specs */}
              <div className='py-3 mb-3'>
                <h2 className='h4 text-light mb-4'>Specifications</h2>
                <Row className='text-light'>
                  <Col sm={6} md={12} lg={6}>
                    <ul className='list-unstyled'>
                      <li className='mb-2'>
                        <strong>Manufacturing Year:</strong>
                        <span className='opacity-70 ms-1'>
                          {
                            advertiseData?.advertise?.advertiseSpecifications.filter(
                              (item) =>
                                item?.specificationValue?.specification
                                  ?.slug === 'model-year'
                            )[0]?.specificationValue?.name
                          }
                        </span>
                      </li>
                      <li className='mb-2'>
                        <strong>Mileage:</strong>
                        <span className='opacity-70 ms-1'>25K miles</span>
                      </li>
                      <li className='mb-2'>
                        <strong>Body Type:</strong>
                        <span className='opacity-70 ms-1'>
                          {
                            advertiseData?.advertise?.advertiseSpecifications.filter(
                              (item) =>
                                item?.specificationValue?.specification
                                  ?.slug === 'vehicle-type'
                            )[0]?.specificationValue?.name
                          }
                        </span>
                      </li>
                      <li className='mb-2'>
                        <strong>Drivetrain:</strong>
                        <span className='opacity-70 ms-1'>
                          Front Wheel Drive
                        </span>
                      </li>
                      <li className='mb-2'>
                        <strong>Engine:</strong>
                        <span className='opacity-70 ms-1'>
                          2.5L Turbo 6 Cylinder
                        </span>
                      </li>
                      <li className='mb-2'>
                        <strong>Transmission:</strong>
                        <span className='opacity-70 ms-1'>
                          {
                            advertiseData?.advertise?.advertiseSpecifications.filter(
                              (item) =>
                                item?.specificationValue?.specification
                                  ?.slug === 'transmission'
                            )[0]?.specificationValue?.name
                          }
                        </span>
                      </li>
                    </ul>
                  </Col>
                  <Col sm={6} md={12} lg={6}>
                    <ul className='list-unstyled'>
                      <li className='mb-2'>
                        <strong>Fuel Type:</strong>
                        <span className='opacity-70 ms-1'>Gasoline</span>
                      </li>
                      <li className='mb-2'>
                        <strong>City MPG:</strong>
                        <span className='opacity-70 ms-1'>20</span>
                        <OverlayTrigger
                          placement='top'
                          overlay={<Tooltip>Verified by seller</Tooltip>}
                        >
                          <i
                            className='fi-alert-circle fs-sm text-primary ms-2'
                            aria-label='Vrified by seller'
                          ></i>
                        </OverlayTrigger>
                      </li>
                      <li className='mb-2'>
                        <strong>Highway MPG:</strong>
                        <span className='opacity-70 ms-1'>29</span>
                        <OverlayTrigger
                          placement='top'
                          overlay={<Tooltip>Verified by seller</Tooltip>}
                        >
                          <i
                            className='fi-alert-circle fs-sm text-primary ms-2'
                            aria-label='Vrified by seller'
                          ></i>
                        </OverlayTrigger>
                      </li>
                      <li className='mb-2'>
                        <strong>Exterior Color:</strong>
                        <span className='opacity-70 ms-1'>
                          {
                            advertiseData?.advertise?.advertiseSpecifications.filter(
                              (item) =>
                                item?.specificationValue?.specification
                                  ?.slug === 'color'
                            )[0]?.specificationValue?.name
                          }
                        </span>
                      </li>
                      <li className='mb-2'>
                        <strong>Interior Color:</strong>
                        <span className='opacity-70 ms-1'>Charcoal</span>
                      </li>
                      <li className='mb-2'>
                        <strong>VIN:</strong>
                        <span className='opacity-70 ms-1'>
                          2VW821AU9JM754284
                        </span>
                      </li>
                    </ul>
                  </Col>
                </Row>
              </div>

              {/* Card with icon boxes */}
              <div className='card card-body p-4 card-light mb-4'>
                <Row xs={2} sm={4} className='gx-3 gx-xl-4 gy-4'>
                  <Col className='text-light text-center'>
                    <div className='d-table bg-dark rounded-3 mx-auto p-3'>
                      <div className='d-flex'>
                        <ImageLoader
                          src='/images/car-finder/icons/check.svg'
                          width={48}
                          height={48}
                          alt='Icon'
                        />
                      </div>
                    </div>
                    <div className='fs-sm pt-2 mt-1'>
                      Checked and Certified by Finder
                    </div>
                  </Col>
                  <Col className='text-light text-center'>
                    <div className='d-table bg-dark rounded-3 mx-auto p-3'>
                      <div className='d-flex'>
                        <ImageLoader
                          src='/images/car-finder/icons/steering-wheel.svg'
                          width={48}
                          height={48}
                          alt='Icon'
                        />
                      </div>
                    </div>
                    <div className='fs-sm pt-2 mt-1'>Single Owner</div>
                  </Col>
                  <Col className='text-light text-center'>
                    <div className='d-table bg-dark rounded-3 mx-auto p-3'>
                      <div className='d-flex'>
                        <ImageLoader
                          src='/images/car-finder/icons/driving-test.svg'
                          width={48}
                          height={48}
                          alt='Icon'
                        />
                      </div>
                    </div>
                    <div className='fs-sm pt-2 mt-1'>Well-Equipped</div>
                  </Col>
                  <Col className='text-light text-center'>
                    <div className='d-table bg-dark rounded-3 mx-auto p-3'>
                      <div className='d-flex'>
                        <ImageLoader
                          src='/images/car-finder/icons/accident.svg'
                          width={48}
                          height={48}
                          alt='Icon'
                        />
                      </div>
                    </div>
                    <div className='fs-sm pt-2 mt-1'>
                      No Accident / Damage Reported
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Features */}
              <h2 className='h4 text-light pt-3 mb-4'>Features</h2>
              <Accordion
                defaultActiveKey='interior'
                className='accordion-light'
              >
                <Accordion.Item eventKey='exterior'>
                  <Accordion.Header>Car Features</Accordion.Header>
                  <Accordion.Body className='fs-sm text-light opacity-70'>
                    <ul>
                      {advertiseData?.advertise?.advertiseSpecifications
                        .filter(
                          (item) =>
                            item?.specificationValue?.specification?.slug ===
                            'car-features'
                        )
                        ?.map((item) => {
                          return <li>{item?.specificationValue?.name}</li>
                        })}
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                {/* <Accordion.Item eventKey='Car Features'>
                <Accordion.Header>Interior</Accordion.Header>
                <Accordion.Body className='fs-sm text-light opacity-70'>
                  <Row xs={1} sm={2}>
                    <Col>
                      <ul>
                        <li>Adjustable Steering Wheel</li>
                        <li>Auto-Dimming Rearview Mirror</li>
                        <li>Driver Adjustable Lumbar</li>
                        <li>Driver Illuminated Vanity Mirror</li>
                        <li>Universal Garage Door Opener</li>
                        <li>Steering Wheel Audio Controls</li>
                      </ul>
                    </Col>
                    <Col>
                      <ul>
                        <li>Heated Front Seats</li>
                        <li>Leather Seats</li>
                        <li>Leather Steering Wheel</li>
                        <li>Pass-Through Rear Seat</li>
                        <li>Passenger Adjustable Lumbar</li>
                        <li>Passenger Illuminated Visor Mirror</li>
                      </ul>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item> */}
                {/* <Accordion.Item eventKey='safety'>
                <Accordion.Header>Safety</Accordion.Header>
                <Accordion.Body className='fs-sm text-light opacity-70'>
                  <Row xs={1} sm={2}>
                    <Col>
                      <ul>
                        <li>Airbag: Driver</li>
                        <li>Airbag: Passenger</li>
                        <li>Adaptive Cruise Control</li>
                        <li>Blind Spot Monitor</li>
                        <li>Alarm</li>
                        <li>Antilock Brakes</li>
                      </ul>
                    </Col>
                    <Col>
                      <ul>
                        <li>Brake Assist</li>
                        <li>Lane Departure Warning</li>
                        <li>Stability Control</li>
                        <li>Fog Lights</li>
                        <li>Power Door Locks</li>
                      </ul>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='technology'>
                <Accordion.Header>Technology</Accordion.Header>
                <Accordion.Body className='fs-sm text-light opacity-70'>
                  <Row xs={1} sm={2}>
                    <Col>
                      <ul>
                        <li>Multi-Zone A/C</li>
                        <li>Climate Control</li>
                        <li>Navigation System</li>
                        <li>Remote Start</li>
                        <li>Bluetooth</li>
                        <li>Remote Start</li>
                      </ul>
                    </Col>
                    <Col>
                      <ul>
                        <li>Apple CarPlay</li>
                        <li>Android Auto</li>
                        <li>Backup Camera</li>
                        <li>HomeLink</li>
                        <li>Keyless Start</li>
                        <li>Premium Sound System</li>
                      </ul>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item> */}
              </Accordion>

              {/* Description */}
              <div className='pb-4 mb-3'>
                <h2 className='h4 text-light pt-4 mt-3'>
                  Seller&apos;s Description
                </h2>
                <p className='text-light opacity-70 mb-1'>
                  Lorem tincidunt lectus vitae id vulputate diam quam. Imperdiet
                  non scelerisque turpis sed etiam ultrices. Blandit mollis
                  dignissim egestas consectetur porttitor. Vulputate dolor
                  pretium, dignissim eu augue sit ut convallis. Lectus est,
                  magna urna feugiat sed ultricies sed in lacinia. Fusce potenti
                  sit id pharetra vel ornare. Vestibulum sed tellus ullamcorper
                  arcu.
                </p>
                <Collapse in={descriptionOpen}>
                  <div id='moreDescription'>
                    <p className='text-light opacity-70 mb-1'>
                      Asperiores eos molestias, aspernatur assumenda vel
                      corporis ex, magni excepturi totam exercitationem quia
                      inventore quod amet labore impedit quae distinctio?
                      Officiis blanditiis consequatur alias, atque, sed est
                      incidunt accusamus repudiandae tempora repellendus
                      obcaecati delectus ducimus inventore tempore harum numquam
                      autem eligendi culpa.
                    </p>
                  </div>
                </Collapse>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault()
                    setDescriptionOpen(!descriptionOpen)
                  }}
                  aria-controls='moreDescription'
                  aria-expanded={descriptionOpen}
                  className={`collapse-label${
                    descriptionOpen ? '' : ' collapsed'
                  }`}
                >
                  {descriptionOpen ? 'Show less' : 'Show more'}
                </a>
              </div>

              {/* Post meta */}
              <div className='d-flex flex-wrap border-top border-light fs-sm text-light pt-4 pb-5 pb-md-2'>
                <div className='border-end border-light pe-3 me-3'>
                  <span className='opacity-70'>
                    Published:{' '}
                    <strong>
                      {new Date(advertiseData?.advertise?.createdOn)
                        .toString()
                        .split(' ')
                        .slice(1, 4)
                        .join(' ')
                        .split(' ')
                        .slice(0, 2)
                        .join(' ') +
                        ', ' +
                        new Date(advertiseData?.advertise?.createdOn)
                          .toString()
                          .split(' ')
                          .slice(3, 4)
                          .join(' ')}
                    </strong>
                  </span>
                </div>
                <div className='border-end border-light pe-3 me-3'>
                  <span className='opacity-70'>
                    Ad number: <strong>681013232</strong>
                  </span>
                </div>
                <div className='opacity-70'>
                  Views: <strong>57</strong>
                </div>
              </div>
            </Col>

            {/* Sidebar */}
            <Col
              as='aside'
              md={5}
              className='pt-5 pt-md-0'
              style={{ marginTop: '-6rem' }}
            >
              <div className='sticky-top pt-5'>
                {/* Price and badges visible on screens >768 */}
                <div className='d-none d-md-block pt-5'>
                  <div className='d-flex mb-4'>
                    <Badge bg='info' className='fs-base me-2'>
                      Used
                    </Badge>
                    <OverlayTrigger
                      trigger={['hover', 'focus']}
                      placement='top'
                      overlay={
                        <Popover>
                          <Popover.Body>
                            <div className='d-flex'>
                              <i className='fi-award mt-1 me-2'></i>
                              <span>
                                This car is checked and
                                <br />
                                certified by Finder.
                              </span>
                            </div>
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <Badge bg='success' className='fs-base'>
                        Certified
                      </Badge>
                    </OverlayTrigger>
                  </div>
                  <div className='h3 text-light'>{`${
                    advertiseData?.advertise?.currency?.symbol === null
                      ? '$'
                      : advertiseData?.advertise?.currency?.symbol
                  } ${sumBy(advertiseData?.advertise?.prices, 'amount')}`}</div>
                  <div className='d-flex align-items-center text-light pb-4 mb-2'>
                    <div className='text-nowrap border-end border-light pe-3 me-3'>
                      <i className='fi-dashboard fs-lg opacity-70 me-2'></i>
                      <span className='align-middle'>25K miles</span>
                    </div>
                    <div className='text-nowrap'>
                      <i className='fi-map-pin fs-lg opacity-70 me-2'></i>
                      <span className='align-middle'>
                        {
                          advertiseData?.advertise?.locationSpecifications[0]
                            ?.locationValue?.name
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seller card */}
                <div className='card card-light card-body mb-4'>
                  <div className='text-light mb-2'>Private Seller</div>
                  <Link
                    href='/car-finder/vendor'
                    className='d-flex align-items-center text-decoration-none mb-3'
                  >
                    <Avatar
                      img={{ src: '/images/avatars/33.jpg', alt: 'Devon Lane' }}
                    />
                    <div className='ps-2'>
                      <h5 className='text-light mb-0'>
                        {advertiseData?.advertise?.product?.user?.name}
                      </h5>
                      <StarRating rating={4.8} />
                      <span className='fs-sm text-light opacity-70 align-middle ms-1'>
                        (5 reviews)
                      </span>
                    </div>
                  </Link>
                  <Link href='/car-finder/vendor' className='text-light'>
                    Other ads by this seller
                  </Link>
                  <div className='pt-4 mt-2'>
                    <Button size='lg' variant='outline-light px-4 mb-3'>
                      <i className='fi-phone me-2'></i>
                      (316) *** **** – reveal
                    </Button>
                    <br />
                    <Button
                      size='lg'
                      onClick={() => setMessageOpen(!messageOpen)}
                      aria-controls='messageForm'
                      aria-expanded={messageOpen}
                    >
                      <i className='fi-chat-left me-2'></i>
                      Send message
                    </Button>
                    <Collapse in={messageOpen}>
                      <div id='messageForm'>
                        <Form
                          noValidate
                          validated={validated}
                          onSubmit={handleSubmit}
                          className='pt-4'
                        >
                          <Form.Group className='mb-3'>
                            <Form.Control
                              as='textarea'
                              rows={5}
                              placeholder='Write your message'
                              className='form-control-light'
                              required
                            />
                            <Form.Control.Feedback type='invalid'>
                              Please enter you message.
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Button type='submit' variant='outline-primary'>
                            Submit
                          </Button>
                        </Form>
                      </div>
                    </Collapse>
                  </div>
                </div>

                {/* Subscription */}
                <div className='card card-body bg-transparent border-light'>
                  <h5 className='text-light'>
                    Email me price drops and new listings for these search
                    results:
                  </h5>
                  <FormGroup light className='mb-3'>
                    <InputGroup>
                      <InputGroup.Text className='text-muted'>
                        <i className='fi-mail'></i>
                      </InputGroup.Text>
                      <Form.Control placeholder='Your email' />
                    </InputGroup>
                    <Button>Subscribe</Button>
                  </FormGroup>
                  <Form.Check
                    type='checkbox'
                    id='subscription-agree'
                    label={
                      <>
                        <span className='fs-sm opacity-70'>
                          I agree to receive price drop alerts on this vehicle
                          and helpful shopping information.
                        </span>
                      </>
                    }
                    className='form-check-light'
                  />
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
              {carsData.map((car, indx) => (
                <SwiperSlide key={indx} className='h-auto'>
                  <VehicleCard
                    href={car.href}
                    images={[[car.img, 473, 242, 'Image']]}
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

      <SignInModalDark
        centered
        size='lg'
        show={modelShow}
        onHide={closeModel}
        onSwap={handleSignInToUp}
      />

      <SignUpModalDark
        centered
        size='lg'
        show={signupShow}
        onHide={closeSignUpModel}
        onSwap={handleSignUpToIn}
      />
    </CarFinderPageLayout>
  )
}

export default SingleItemPage
