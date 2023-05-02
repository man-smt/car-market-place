import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import CarFinderPageLayout from '../../components/partials/CarFinderPageLayout'
import Link from 'next/link'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Offcanvas from 'react-bootstrap/Offcanvas'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import VehicleCard from '../../components/VehicleCard'
import SimpleBar from 'simplebar-react'
import ReactSlider from 'react-slider'
import 'simplebar/dist/simplebar.min.css'
import { useQuery } from '@apollo/client'
import client from '../../apollo'
import {
  ADVERTISES,
  BRANDS,
  COUNTRIES,
  SPECIFICATIONS,
} from '../../graphql/Queries'
import NotFoundPage from './404-not-found'
import SignInModalDark from '../../components/partials/SignInModalDark'
import SignUpModalDark from '../../components/partials/SignUpModalDark'
import { ADD_FAVORITE } from '../../graphql/Mutations'
import { get, isEmpty, sumBy } from 'lodash'
import { Alert, Spinner } from 'react-bootstrap'
import InfiniteScroll from 'react-infinite-scroll-component'

const CatalogPage = () => {
  // Add extra class to body
  const router = useRouter()
  const searchObj = localStorage.getItem('searchObj')
  const newSearch = router.query.newSearch

  const [show, setShow] = useState(false)
  const [modelShow, setModelShow] = useState(false)
  const [signupShow, setSignupShow] = useState(false)
  const [filters, setFilters] = useState({})
  const [carFilter, setCarFilter] = useState({ createdOn: 'DESC' })
  const [selected, setSelected] = useState([])
  const [addShow, setAddShow] = useState(false)
  const [showError, setShowError] = useState([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [skip, setSkip] = useState(0)
  const [count, setCount] = useState(0)
  const [productData, setProductData] = useState([])
  const [newData, setNewData] = useState([])
  const [where, setWhere] = useState({})

  useEffect(() => {
    if (productData?.length <= count) {
      setHasMore(true)
    }
  }, [productData, count])

  useEffect(() => {
    if (selected.length) {
      setWhere((old) => {
        return {
          ...old,
          advertiseSpecifications: {
            some: {
              specificationValue: {
                slug: { in: selected },
              },
            },
          },
        }
      })
    }
  }, [selected])

  useEffect(() => {
    const body = document.querySelector('body')
    document.body.classList.add('fixed-bottom-btn')
    return () => body.classList.remove('fixed-bottom-btn')
  }, [])

  const {
    data,
    loading: specificationsLoading,
    error: specificationsError,
  } = useQuery(SPECIFICATIONS, {
    variables: { where: {} },
    fetchPolicy: 'network-only',
  })

  const {
    data: countriesData,
    loading: countriesLoading,
    error: countriesError,
  } = useQuery(COUNTRIES, { fetchPolicy: 'network-only' })

  const {
    data: brandsData,
    loading: brandsLoading,
    error: brandsError,
  } = useQuery(BRANDS, { fetchPolicy: 'network-only' })

  // useEffect(() => {
  //   if (searchObj) {
  //     const obj = JSON.parse(searchObj)
  //     setWhere((old) => {
  //       return {
  //         ...old,
  //         ...obj,
  //       }
  //     })
  //   }
  // }, [searchObj])

  useEffect(() => {
    setLoading(true)

    client
      .query({
        query: ADVERTISES,
        variables: {
          where: searchObj ? JSON.parse(searchObj) : where,
          take: 10,
          skip: count > 10 ? skip : 0,
          order: [carFilter],
        },
        fetchPolicy: 'network-only',
      })

      .then((res) => {
        setProductData((curr) => {
          return [...res.data.advertises.items]
        })
        setCount(res.data.advertises?.totalCount)
        // res.data?.advertises?.items.map((product) => {
        //   product['img'] = ['/images/car-finder/catalog/01.jpg']
        //   product['href'] = `/car-finder/${product?.iD}`
        // })
        setLoading(false)
        localStorage.removeItem('searchObj')
      })
      .catch((err) => setLoading(false))
      .finally(() => setLoading(false))
  }, [skip, where, carFilter])

  if (specificationsError || countriesError || brandsError)
    return <NotFoundPage />

  // Query param (Switch between Grid and List view)

  const viewParam = router.query.view === 'list' ? 'list' : 'grid'

  // Offcanvas show/hide
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const closeModel = () => setModelShow(false)
  const closeSignUpModel = () => setSignupShow(false)

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
        setShowError(err?.networkError?.result?.errors)
      })
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setProductData([])
    // console.log(name, value)

    router.replace(`/car-finder/catalog?view=grid&${name}=${value}`)

    const queryParam = `${name}=${value}`
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${queryParam}`
    window.history.pushState({ path: newUrl }, '', newUrl)

    console.log(queryParam)

    // if (name === 'model') {
    //   setWhere({
    //     product: {
    //       productSpecifications: {
    //         some: {
    //           specificationValue: {
    //             slug: { eq: value },
    //             specification: { slug: { contains: 'model' } },
    //           },
    //         },
    //       },
    //     },
    //   })
    // }

    if (newSearch) {
      if (newSearch === 'new') {
        setWhere((old) => {
          return {
            ...old,
            new: newSearch,
          }
        })
      } else if (newSearch === 'used') {
        setWhere((old) => {
          return {
            ...old,
            used: newSearch,
          }
        })
      }
    }

    // if (name === 'brand') {
    //   setWhere((old) => {
    //     return {
    //       ...old,
    //       product: { brand: { slug: { contains: value } } },
    //     }
    //   })
    // }

    if (name === 'modelYear') {
      setWhere((old) => {
        return {
          ...old,
          advertiseSpecifications: {
            some: {
              specificationValue: {
                slug: { eq: value },
                specification: { slug: { contains: 'model-year' } },
              },
            },
          },
        }
      })
    }

    if (name === 'RentalPeriod') {
      setWhere((old) => {
        return {
          ...old,
          RentalPeriod: {
            contains: value,
          },
        }
      })
    }

    if (name === 'paymentMode') {
      setWhere((old) => {
        return {
          ...old,
          paymentMode: {
            contains: value,
          },
        }
      })
    }

    // if (name === 'minimum-required-age') {
    //   setWhere((old) => {
    //     return {
    //       ...old,
    //       advertiseSpecifications: {
    //         some: {
    //           specificationValue: {
    //             slug: { eq: value },
    //             specification: { slug: { contains: 'minimum-required-age' } },
    //           },
    //         },
    //       },
    //     }
    //   })
    // }

    // if (name === 'doors') {
    //   setWhere((old) => {
    //     return {
    //       ...old,
    //       advertiseSpecifications: {
    //         some: {
    //           specificationValue: {
    //             slug: { eq: value },
    //             specification: { slug: { contains: 'doors' } },
    //           },
    //         },
    //       },
    //     }
    //   })
    // }

    if (name === 'AirportDelivery') {
      setWhere((old) => {
        return {
          ...old,
          AirportDelivery: {
            contains: value,
          },
        }
      })
    }

    if (name === 'AmericanSpecs') {
      setWhere((old) => {
        return {
          ...old,
          AmericanSpecs: {
            contains: value,
          },
        }
      })
    }

    if (name === 'bags') {
      setWhere((old) => {
        return {
          ...old,
          advertiseSpecifications: {
            some: {
              specificationValue: {
                slug: { eq: value },
                specification: { slug: { contains: 'bags' } },
              },
            },
          },
        }
      })
    }

    if (name === 'branchPickUp') {
      setWhere((old) => {
        return {
          ...old,
          branchPickUp: {
            contains: value,
          },
        }
      })
    }

    if (name === 'DeliveryToYou') {
      setWhere((old) => {
        return {
          ...old,
          DeliveryToYou: {
            contains: value,
          },
        }
      })
    }

    if (name === 'engine-capacity') {
      setWhere((old) => {
        return {
          ...old,
          advertiseSpecifications: {
            some: {
              specificationValue: {
                slug: { eq: value },
                specification: { slug: { contains: 'engine-capacity' } },
              },
            },
          },
        }
      })
    }

    if (name === 'EuroSpecs') {
      setWhere((old) => {
        return {
          ...old,
          EuroSpecs: {
            contains: value,
          },
        }
      })
    }

    // if (name === 'free-delivery') {
    //   setWhere((old) => {
    //     return {
    //       ...old,
    //       advertiseSpecifications: {
    //         some: {
    //           specificationValue: {
    //             slug: { eq: value },
    //             specification: { slug: { contains: 'free-delivery' } },
    //           },
    //         },
    //       },
    //     }
    //   })
    // }

    if (name === 'fuelType') {
      setWhere((old) => {
        return {
          ...old,
          fuelType: {
            contains: value,
          },
        }
      })
    }

    // if (name === 'gcc-specs') {
    //   setWhere((old) => {
    //     return {
    //       ...old,
    //       advertiseSpecifications: {
    //         some: {
    //           specificationValue: {
    //             slug: { eq: value },
    //             specification: { slug: { contains: 'gcc-specs' } },
    //           },
    //         },
    //       },
    //     }
    //   })
    // }

    if (name === 'insurance-included') {
      setWhere((old) => {
        return {
          ...old,
          advertiseSpecifications: {
            some: {
              specificationValue: {
                slug: { eq: value },
                specification: { slug: { contains: 'insurance-included' } },
              },
            },
          },
        }
      })
    }

    // if (name === 'InternationalSpecs') {
    //   setWhere((old) => {
    //     return {
    //       ...old,
    //       InternationalSpecs: {
    //         contains: value,
    //       },
    //     }
    //   })
    // }

    if (name === 'LanguagesSpoken') {
      setWhere((old) => {
        return {
          ...old,
          LanguagesSpoken: {
            contains: value,
          },
        }
      })
    }

    // if (name === 'Mileages') {
    //   setWhere((old) => {
    //     return {
    //       ...old,
    //       advertiseSpecifications: {
    //         some: {
    //           specificationValue: {
    //             slug: { eq: value },
    //             specification: { slug: { contains: 'mileages' } },
    //           },
    //         },
    //       },
    //     }
    //   })
    // }

    if (name === 'minimum-days') {
      setWhere((old) => {
        return {
          ...old,
          advertiseSpecifications: {
            some: {
              specificationValue: {
                slug: { eq: value },
                specification: { slug: { contains: 'minimum-days' } },
              },
            },
          },
        }
      })
    }

    if (name === 'OpenNow') {
      setWhere((old) => {
        return {
          ...old,
          OpenNow: {
            contains: value,
          },
        }
      })
    }

    if (name === 'TimeSheets') {
      setWhere((old) => {
        return {
          ...old,
          TimeSheets: {
            contains: value,
          },
        }
      })
    }

    if (name === 'insurance-included') {
      setWhere((old) => {
        return {
          ...old,
          advertiseSpecifications: {
            some: {
              specificationValue: {
                slug: { eq: value },
                specification: { slug: { contains: 'insurance-included' } },
              },
            },
          },
        }
      })
    }

    // if (name === 'country') {
    //   setWhere((old) => {
    //     return {
    //       ...old,
    //       // locationSpecifications: {
    //       //   some: {
    //       //     locationValue: {
    //       //       country: { slug: { contains: value } },
    //       //     },
    //       //   },
    //       // },
    //       country: { slug: { contains: value } },
    //     }
    //   })
    // }

    if (name === 'area') {
      setWhere((old) => {
        return {
          ...old,
          area: {
            contains: value,
          },
        }
      })
    }

    if (name === 'new') {
      setWhere((old) => {
        return {
          ...old,
          new: {
            contains: value,
          },
        }
      })
    }

    setFilters((oldData) => {
      return {
        ...oldData,
        [name]: value,
      }
    })
  }

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

  const SelectChange = (e) => {
    if (e?.target?.dataset?.rrUiEventKey === 'new') {
      setFilters((curr) => {
        return { ...curr, new: e?.target?.dataset?.rrUiEventKey }
      })
    } else {
      setFilters((curr) => {
        return { ...curr, used: e?.target?.dataset?.rrUiEventKey }
      })
    }
  }

  const handleChecked = (e) => {
    const { name, checked, value } = e.target
    setProductData([])
    if (checked) {
      setSelected((oldData) => {
        if (oldData) {
          return [...oldData, value]
        } else {
          return [name]
        }
      })
    } else {
      setSelected((oldData) => oldData?.filter((item) => item !== value))
    }
  }

  const selectOffer = (e) => {
    const { value } = e.target
    if (value === 'newest') {
      setCarFilter({ createdOn: 'DESC' })
    } else if (value === 'priceLH') {
      setCarFilter({ price: 'ASC' })
    } else if (value === 'priceHL') {
      setCarFilter({ price: 'DESC' })
    } else if (value === 'popular') {
      setCarFilter({ createdOn: 'ASC' })
    }
  }

  const country = countriesData?.countries?.items

  const area = data?.specifications?.items?.filter(
    (item) => item?.slug === 'area'
  )[0]?.specificationValues

  const brand = brandsData?.brands?.items

  const model = data?.specifications?.items?.filter(
    (item) => item?.slug === 'model'
  )[0]?.specificationValues

  const modelYear = data?.specifications?.items?.filter(
    (item) => item?.slug === 'model-year'
  )[0]?.specificationValues

  const seats = data?.specifications?.items?.filter(
    (item) => item?.slug === 'seats'
  )[0]?.specificationValues

  const vehicleType = data?.specifications?.items?.filter(
    (item) => item?.slug === 'vehicle-type'
  )[0]?.specificationValues

  const RentalPeriod = data?.specifications?.items?.filter(
    (item) => item?.slug === 'rental-period'
  )[0]?.specificationValues

  const carFeatures = data?.specifications?.items?.filter(
    (item) => item?.slug === 'car-features'
  )[0]?.specificationValues

  const paymentMode = data?.specifications?.items?.filter(
    (item) => item?.slug === 'payment-mode'
  )[0]?.specificationValues

  const transmission = data?.specifications?.items?.filter(
    (item) => item?.slug === 'transmission'
  )[0]?.specificationValues

  const Color = data?.specifications?.items?.filter(
    (item) => item?.slug === 'color'
  )[0]?.specificationValues

  const MinimumRequiredAge = data?.specifications?.items?.filter(
    (item) => item?.slug === 'minimum-required-age'
  )[0]?.specificationValues

  const Doors = data?.specifications?.items?.filter(
    (item) => item?.slug === 'doors'
  )[0]?.specificationValues

  const AirportDelivery = data?.specifications?.items?.filter(
    (item) => item?.slug === 'airport-delivery'
  )[0]?.specificationValues

  const AmericanSpecs = data?.specifications?.items?.filter(
    (item) => item?.slug === 'american-specs'
  )[0]?.specificationValues

  const bags = data?.specifications?.items?.filter(
    (item) => item?.slug === 'bags'
  )[0]?.specificationValues

  const branchPickUp = data?.specifications?.items?.filter(
    (item) => item?.slug === 'branch-pick-up'
  )[0]?.specificationValues

  const DeliveryToYou = data?.specifications?.items?.filter(
    (item) => item?.slug === 'delivery-to-you'
  )[0]?.specificationValues

  const EngineCapacity = data?.specifications?.items?.filter(
    (item) => item?.slug === 'engine-capacity'
  )[0]?.specificationValues

  const EuroSpecs = data?.specifications?.items?.filter(
    (item) => item?.slug === 'euro-specs'
  )[0]?.specificationValues

  const FreeDelivery = data?.specifications?.items?.filter(
    (item) => item?.slug === 'free-delivery'
  )[0]?.specificationValues

  const fuelType = data?.specifications?.items?.filter(
    (item) => item?.slug === 'fuel-type'
  )[0]?.specificationValues

  const gccSpecs = data?.specifications?.items?.filter(
    (item) => item?.slug === 'gcc-specs'
  )[0]?.specificationValues

  const InsuranceIncluded = data?.specifications?.items?.filter(
    (item) => item?.slug === 'insurance-included'
  )[0]?.specificationValues

  const InternationalSpecs = data?.specifications?.items?.filter(
    (item) => item?.slug === 'international-specs'
  )[0]?.specificationValues

  const LanguagesSpoken = data?.specifications?.items?.filter(
    (item) => item?.slug === 'languages-spoken'
  )[0]?.specificationValues

  const Mileages = data?.specifications?.items?.filter(
    (item) => item?.slug === 'mileages'
  )[0]?.specificationValues

  const MinimumDays = data?.specifications?.items?.filter(
    (item) => item?.slug === 'minimum-days'
  )[0]?.specificationValues

  const OpenNow = data?.specifications?.items?.filter(
    (item) => item?.slug === 'open-now'
  )[0]?.specificationValues

  const TimeSheets = data?.specifications?.items?.filter(
    (item) => item?.slug === 'time-sheets'
  )[0]?.specificationValues

  const Vat = data?.specifications?.items?.filter(
    (item) => item?.slug === 'vat'
  )[0]?.specificationValues

  // Selection array
  const selection = [
    'Under 2019',
    'Crossover',
    'Sedan',
    'SUV',
    'Diesel',
    'Gasoline',
    'Hybrid',
  ]

  // Body type checkboxes array
  const bodyType = [
    { value: 'Sedan', checked: true },
    { value: 'SUV', checked: true },
    { value: 'Wagon', checked: false },
    { value: 'Crossover', checked: true },
    { value: 'Coupe', checked: false },
    { value: 'Pickup', checked: false },
    { value: 'Sport Coupe', checked: false },
    { value: 'Compact', checked: false },
    { value: 'Convertible', checked: false },
    { value: 'Family MPV', checked: false },
  ]

  // Drivetrain checkboxes array
  const drivetrain = [
    { value: 'AWD/4WD', checked: false },
    { value: 'Front Wheel Drive', checked: false },
    { value: 'Rear Wheel Drive', checked: false },
  ]

  // Seller checkboxes array
  const seller = [
    { value: 'Dealers only', checked: false },
    { value: 'Private Sellers Only', checked: false },
  ]

  // Price range slider
  const PriceRange = () => {
    const [minPrice, setMinPrice] = useState(25000)
    const [maxPrice, setMaxPrice] = useState(65000)

    const handleInputChange = (e) => {
      if (e.target.name === 'minPrice') {
        setMinPrice(e.target.value)
      } else {
        setMaxPrice(e.target.value)
      }
    }

    const handleSliderChange = (sliderVal) => {
      let sliderMinVal = sliderVal[0]
      let sliderMaxVal = sliderVal[1]
      setMinPrice(sliderMinVal)
      setMaxPrice(sliderMaxVal)
    }

    return (
      <>
        <div className='range-slider-light'>
          <ReactSlider
            className='range-slider range-slider-light'
            thumbClassName='range-slider-handle'
            trackClassName='range-slider-track'
            min={4000}
            max={100000}
            value={[minPrice, maxPrice]}
            ariaLabel={['Lower handle', 'Upper handle']}
            ariaValuetext={(state) => `Handle value ${state.valueNow}`}
            step={1000}
            renderThumb={(props, state) => (
              <div {...props}>
                <div className='range-slider-tooltip'>$ {state.valueNow}</div>
              </div>
            )}
            pearling
            minDistance={5000}
            onChange={handleSliderChange}
          />
        </div>
        <div className='d-flex align-items-center'>
          <div className='w-100 pe-2'>
            <Form.Control
              type='number'
              step={1000}
              name='minPrice'
              value={minPrice}
              onChange={handleInputChange}
              className='form-control-light'
            />
          </div>
          <div className='text-muted'>—</div>
          <div className='w-100 ps-2'>
            <Form.Control
              type='number'
              step={1000}
              name='maxPrice'
              value={maxPrice}
              onChange={handleInputChange}
              className='form-control-light'
            />
          </div>
        </div>
      </>
    )
  }
  const fetchData = () => {
    setSkip((old) => old + 10)
  }

  return (
    <CarFinderPageLayout
      pageTitle={`Catalog ${viewParam === 'list' ? 'List' : 'Grid'}`}
      activeNav='Catalog'
    >
      <Container className='mt-5 mb-md-4 py-5'>
        <Row className='py-md-1'>
          {/* Filters sidebar (Offcanvas on mobile < 992px) */}
          <Col as='aside' lg={3} className='pe-xl-4'>
            <Offcanvas
              show={show}
              onHide={handleClose}
              responsive='lg'
              className='bg-dark'
            >
              <Offcanvas.Header
                className='bg-transparent'
                closeButton
                closeVariant='white'
              >
                <Offcanvas.Title as='h5' className='text-light'>
                  Filters
                </Offcanvas.Title>
              </Offcanvas.Header>

              {/* Nav tabs */}
              <Offcanvas.Header className='d-block bg-transparent border-bottom border-light pt-0 pt-lg-4 px-lg-0'>
                <Nav variant='tabs nav-tabs-light mb-0' defaultActiveKey='used'>
                  <Nav.Item>
                    <Nav.Link value='new' eventKey='new' onClick={SelectChange}>
                      Search New
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      value='used'
                      onClick={SelectChange}
                      eventKey='used'
                    >
                      Search Used
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Offcanvas.Header>

              {/* Offcanvas body */}
              <Offcanvas.Body className='py-lg-4'>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Country</h3>
                  <Form.Select
                    name='country'
                    defaultValue='any'
                    onChange={(e) =>
                      setWhere((curr) => {
                        return {
                          ...curr,
                          country: { slug: { contains: e.target.value } },
                        }
                      })
                    }
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='country'>
                      Select Country
                    </option>
                    {country?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Area</h3>
                  {area?.map((item, key) => {
                    const { name, id } = item
                    return (
                      <Form.Check
                        key={key}
                        name='area'
                        onChange={handleChange}
                        // key={indx}
                        // id={`fuelType-${indx}`}
                        value={name}
                        // defaultChecked={checked}
                        label={
                          <>
                            <span className='fs-sm'>{name}</span>
                          </>
                        }
                        className='form-check-light'
                      />
                    )
                  })}
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Make &amp; Model</h3>
                  <Form.Select
                    name='brand'
                    defaultValue='any'
                    className='form-select-light mb-2'
                    onChange={(e) =>
                      setWhere((old) => {
                        return {
                          ...old,
                          product: {
                            brand: { slug: { contains: e.target.value } },
                          },
                        }
                      })
                    }
                  >
                    <option defaultValue value='brand'>
                      Select Brand
                    </option>
                    {brand?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                  <Form.Select
                    name='model'
                    defaultValue='any'
                    className='form-select-light mb-1'
                    onChange={(e) =>
                      setWhere({
                        product: {
                          productSpecifications: {
                            some: {
                              specificationValue: {
                                slug: { eq: e.target.value },
                                specification: { slug: { contains: 'model' } },
                              },
                            },
                          },
                        },
                      })
                    }
                  >
                    <option defaultValue value='model'>
                      Select Model
                    </option>
                    {model?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                {/* Year */}
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light pt-1'>Year</h3>
                  <div className='d-flex align-items-center'>
                    <Form.Select
                      defaultValue='2019'
                      className='form-select-light w-100'
                    >
                      <option value='to' disabled>
                        Select Year
                      </option>
                      <option value='2022'>2022</option>
                      <option value='2021'>2021</option>
                      <option value='2020'>2020</option>
                      <option value='2019'>2019</option>
                      <option value='2018'>2018</option>
                      <option value='2017'>2017</option>
                      <option value='2016'>2016</option>
                      <option value='2015'>2015</option>
                    </Form.Select>
                    <div className='mx-2'>&mdash;</div>

                    <Form.Select
                      defaultValue='from'
                      name='modelYear'
                      className='form-select-light w-100'
                      onChange={(e) =>
                        setWhere((old) => {
                          return {
                            ...old,
                            advertiseSpecifications: {
                              some: {
                                specificationValue: {
                                  slug: { eq: e.target.value },
                                  specification: {
                                    slug: { contains: 'model-year' },
                                  },
                                },
                              },
                            },
                          }
                        })
                      }
                    >
                      <option defaultValue value='year'>
                        To
                      </option>
                      {modelYear?.map((item, key) => {
                        const { name, id } = item
                        return (
                          <option key={key} value={name}>
                            {name}
                          </option>
                        )
                      })}
                    </Form.Select>
                  </div>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Seats</h3>
                  {seats?.map((item, key) => {
                    const { name, id, slug } = item
                    return (
                      <Form.Check
                        key={key}
                        name='seats'
                        onChange={handleChecked}
                        // key={indx}
                        // id={`fuelType-${indx}`}
                        value={slug}
                        // defaultChecked={checked}
                        label={
                          <>
                            <span className='fs-sm'>{name}</span>
                          </>
                        }
                        className='form-check-light'
                      />
                    )
                  })}
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Vehicle Type</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {vehicleType?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <Form.Check
                          key={key}
                          onChange={handleChecked}
                          name='vehicleType'
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={slug}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Rental Period</h3>
                  <Form.Select
                    name='RentalPeriod'
                    defaultValue='any'
                    onChange={handleChange}
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='Rental'>
                      Select Rental Period
                    </option>
                    {RentalPeriod?.map((item, key) => {
                      const { name, id } = item
                      return (
                        <option key={key} value={id}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Car Features</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {carFeatures?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <Form.Check
                          key={key}
                          onChange={handleChecked}
                          name='carFeatures'
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={slug}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Payment Mode</h3>
                  {paymentMode?.map((item, key) => {
                    const { name, id } = item
                    return (
                      <Form.Check
                        key={key}
                        onChange={handleChecked}
                        name='paymentMode'
                        // key={indx}
                        // id={`fuelType-${indx}`}
                        value={id}
                        // defaultChecked={checked}
                        label={
                          <>
                            <span className='fs-sm'>{name}</span>
                          </>
                        }
                        className='form-check-light'
                      />
                    )
                  })}
                </div>
                {/* Transmission */}
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Transmission</h3>
                  {transmission?.map((item, key) => {
                    const { name, id, slug } = item
                    return (
                      <Form.Check
                        key={key}
                        onChange={handleChecked}
                        name='transmission'
                        // key={indx}
                        // id={`fuelType-${indx}`}
                        value={slug}
                        // defaultChecked={checked}
                        label={
                          <>
                            <span className='fs-sm'>{name}</span>
                          </>
                        }
                        className='form-check-light'
                      />
                    )
                  })}
                </div>
                {/* Color */}
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Color</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {Color?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <Form.Check
                          key={key}
                          onChange={handleChecked}
                          name='Color'
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={slug}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Minimum Required Age</h3>
                  <Form.Select
                    name='MinimumRequiredAge'
                    defaultValue='any'
                    onChange={(e) =>
                      setWhere((old) => {
                        return {
                          ...old,
                          advertiseSpecifications: {
                            some: {
                              specificationValue: {
                                slug: { eq: e.target.value },
                                specification: {
                                  slug: { contains: 'minimum-required-age' },
                                },
                              },
                            },
                          },
                        }
                      })
                    }
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='age'>
                      Select Age
                    </option>
                    {MinimumRequiredAge?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Doors</h3>
                  <Form.Select
                    name='Doors'
                    onChange={(e) =>
                      setWhere((old) => {
                        return {
                          ...old,
                          advertiseSpecifications: {
                            some: {
                              specificationValue: {
                                slug: { eq: e.target.value },
                                specification: { slug: { contains: 'doors' } },
                              },
                            },
                          },
                        }
                      })
                    }
                    defaultValue='any'
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='doors'>
                      Select Doors
                    </option>
                    {Doors?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Airport Delivery</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {AirportDelivery?.map((item, key) => {
                      const { name, id } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          name='AirportDelivery'
                          onChange={handleChange}
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={id}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>American Specs</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {AmericanSpecs?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          name='AmericanSpecs'
                          onChange={handleChange}
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={slug}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Bags</h3>
                  <Form.Select
                    name='bags'
                    defaultValue='any'
                    onChange={(e) =>
                      setWhere((old) => {
                        return {
                          ...old,
                          advertiseSpecifications: {
                            some: {
                              specificationValue: {
                                slug: { eq: e.target.value },
                                specification: { slug: { contains: 'bags' } },
                              },
                            },
                          },
                        }
                      })
                    }
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='bags'>
                      Select Bags
                    </option>
                    {bags?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Branch Pick Up</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {branchPickUp?.map((item, key) => {
                      const { name, id } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          name='branchPickUp'
                          onChange={handleChange}
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={id}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Delivery To You</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {DeliveryToYou?.map((item, key) => {
                      const { name, id } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          name='DeliveryToYou'
                          onChange={handleChange}
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={id}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Engine Capacity</h3>
                  {EngineCapacity?.map((item, key) => {
                    const { name, id, slug } = item
                    return (
                      <Form.Check
                        key={key}
                        type='radio'
                        name='EngineCapacity'
                        onChange={(e) => {
                          setWhere((old) => {
                            return {
                              ...old,
                              advertiseSpecifications: {
                                some: {
                                  specificationValue: {
                                    slug: { eq: e.target.value },
                                    specification: {
                                      slug: { contains: 'engine-capacity' },
                                    },
                                  },
                                },
                              },
                            }
                          })
                        }}
                        // key={indx}
                        // id={`fuelType-${indx}`}
                        value={slug}
                        // defaultChecked={checked}
                        label={
                          <>
                            <span className='fs-sm'>{name}</span>
                          </>
                        }
                        className='form-check-light'
                      />
                    )
                  })}
                  {/* <Form.Check
                    name='EngineCapacity'
                    type='radio'
                    onChange={handleChange}
                    defaultValue='any'
                    className='form-select-light mb-2'
                  >
                    {EngineCapacity?.map((item, key) => {
                      const { name, iD } = item
                      return <option key={key} value={iD}>{name}</option>
                    })}
                  </Form.Check> */}
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Euro Specs</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {EuroSpecs?.map((item, key) => {
                      const { name, id } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          name='EuroSpecs'
                          onChange={handleChange}
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={id}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Free Delivery</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {FreeDelivery?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          onChange={(e) =>
                            setWhere((old) => {
                              return {
                                ...old,
                                advertiseSpecifications: {
                                  some: {
                                    specificationValue: {
                                      slug: { eq: e.target.value },
                                      specification: {
                                        slug: { contains: 'free-delivery' },
                                      },
                                    },
                                  },
                                },
                              }
                            })
                          }
                          name='FreeDelivery'
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={slug}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                {/* Fuel Type */}
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Fuel Type</h3>
                  {fuelType?.map((item, key) => {
                    const { name, id } = item
                    return (
                      <Form.Check
                        key={key}
                        onChange={handleChange}
                        name='fuelType'
                        // key={indx}
                        // id={`fuelType-${indx}`}
                        value={id}
                        // defaultChecked={checked}
                        label={
                          <>
                            <span className='fs-sm'>{name}</span>
                          </>
                        }
                        className='form-check-light'
                      />
                    )
                  })}
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>GCC Specs</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {gccSpecs?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          name='gccSpecs'
                          onChange={(e) =>
                            setWhere((old) => {
                              return {
                                ...old,
                                advertiseSpecifications: {
                                  some: {
                                    specificationValue: {
                                      slug: { eq: e.target.value },
                                      specification: {
                                        slug: { contains: 'gcc-specs' },
                                      },
                                    },
                                  },
                                },
                              }
                            })
                          }
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={slug}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Insurance Included</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {InsuranceIncluded?.map((item, key) => {
                      const { name, id } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          name='InsuranceIncluded'
                          onChange={handleChange}
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={id}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>International Specs</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {InternationalSpecs?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          name='InternationalSpecs'
                          onChange={(e) =>
                            setWhere((old) => {
                              return {
                                ...old,
                                advertiseSpecifications: {
                                  all: {
                                    specificationValue: {
                                      slug: { contains: e.target.value },
                                      specification: {
                                        slug: {
                                          contains: 'international-specs',
                                        },
                                      },
                                    },
                                  },
                                },
                                // InternationalSpecs: {
                                //   contains: e.target.value,
                                // },
                              }
                            })
                          }
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={slug}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Languages Spoken</h3>
                  <Form.Select
                    onChange={(e) =>
                      setWhere((old) => {
                        return {
                          ...old,
                          advertiseSpecifications: {
                            some: {
                              specificationValue: {
                                slug: { eq: e.target.value },
                                specification: {
                                  slug: { contains: 'languages-spoken' },
                                },
                              },
                            },
                          },
                        }
                      })
                    }
                    name='LanguagesSpoken'
                    defaultValue='any'
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='language'>
                      Select Language
                    </option>
                    {LanguagesSpoken?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                {/* Mileage */}
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Mileages</h3>
                  <Form.Select
                    onChange={(e) =>
                      setWhere((old) => {
                        return {
                          ...old,
                          advertiseSpecifications: {
                            some: {
                              specificationValue: {
                                slug: { eq: e.target.value },
                                specification: {
                                  slug: { contains: 'mileages' },
                                },
                              },
                            },
                          },
                        }
                      })
                    }
                    name='Mileages'
                    defaultValue='any'
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='mileages'>
                      Select Mileages
                    </option>
                    {Mileages?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Minimum Days</h3>
                  <Form.Select
                    onChange={(e) =>
                      setWhere((old) => {
                        return {
                          ...old,
                          advertiseSpecifications: {
                            some: {
                              specificationValue: {
                                slug: { eq: e.target.value },
                                specification: {
                                  slug: { contains: 'minimum-days' },
                                },
                              },
                            },
                          },
                        }
                      })
                    }
                    name='MinimumDays'
                    defaultValue='any'
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='minimumDays'>
                      Select Minimum Days
                    </option>
                    {MinimumDays?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Open Now</h3>
                  <SimpleBar
                    autoHide={false}
                    className='simplebar-no-autohide simplebar-light'
                    style={{ maxHeight: '11rem' }}
                  >
                    {OpenNow?.map((item, key) => {
                      const { name, id } = item
                      return (
                        <Form.Check
                          key={key}
                          type='radio'
                          name='OpenNow'
                          onChange={handleChange}
                          // key={indx}
                          // id={`fuelType-${indx}`}
                          value={id}
                          // defaultChecked={checked}
                          label={
                            <>
                              <span className='fs-sm'>{name}</span>
                            </>
                          }
                          className='form-check-light'
                        />
                      )
                    })}
                  </SimpleBar>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Time Sheets</h3>
                  <Form.Select
                    onChange={(e) =>
                      setWhere((old) => {
                        return {
                          ...old,
                          advertiseSpecifications: {
                            some: {
                              specificationValue: {
                                slug: { eq: e.target.value },
                                specification: {
                                  slug: { contains: 'time-sheets' },
                                },
                              },
                            },
                          },
                        }
                      })
                    }
                    name='TimeSheets'
                    defaultValue='any'
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='time'>
                      Select Time Sheet
                    </option>
                    {TimeSheets?.map((item, key) => {
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
                <div className='pb-4 mb-2'>
                  <h3 className='h6 text-light'>Vat</h3>
                  <Form.Select
                    onChange={(e) =>
                      setWhere((old) => {
                        return {
                          ...old,
                          advertiseSpecifications: {
                            some: {
                              specificationValue: {
                                slug: { eq: e.target.value },
                                specification: {
                                  slug: { contains: 'vat' },
                                },
                              },
                            },
                          },
                        }
                      })
                    }
                    name='Vat'
                    defaultValue='any'
                    className='form-select-light mb-2'
                  >
                    <option defaultValue value='Vat'>
                      Select Vat
                    </option>
                    {Vat?.map((item, key) => {
                      console.log(Vat, 'vat')
                      const { name, id, slug } = item
                      return (
                        <option key={key} value={slug}>
                          {name}
                        </option>
                      )
                    })}
                  </Form.Select>
                </div>
              </Offcanvas.Body>
            </Offcanvas>
          </Col>

          <Col lg={9}>
            {/* Breadcrumb */}
            <Breadcrumb className='breadcrumb-light mb-3 pt-md-2 pt-lg-4'>
              <Breadcrumb.Item linkAs={Link} href='/car-finder'>
                Home
              </Breadcrumb.Item>
              <Breadcrumb.Item active>Used cars</Breadcrumb.Item>
            </Breadcrumb>
            {addShow && (
              <Alert variant={'danger'}>
                <p className='mb-0'>Something Went Wrong !</p>
              </Alert>
            )}
            {/* Page title */}
            <div className='d-flex align-items-center justify-content-between pb-4 mb-2'>
              <h1 className='text-light me-3 mb-0'>Used cars</h1>
              <div className='text-light'>
                <i className='fi-car fs-lg me-2'></i>
                <span className='align-middle'>{count} offers</span>
              </div>
            </div>
            {/* Sorting + View switcher */}
            <div className='d-sm-flex align-items-center justify-content-between pb-4 mb-2'>
              <Form.Group
                controlId='sortbyTop'
                className='d-flex align-items-center me-sm-4'
              >
                <Form.Label className='fs-sm fw-normal text-light text-nowrap mb-0 me-2 pe-1'>
                  <i className='fi-arrows-sort mt-n1 me-2'></i>
                  Sort by:
                </Form.Label>
                <Form.Select
                  size='sm'
                  className='form-select-light me-sm-4'
                  onChange={selectOffer}
                >
                  <option value='newest'>Newest</option>
                  <option value='popular'>Popular</option>
                  <option value='priceLH'>Price: Low - High</option>
                  <option value='priceHL'>Price: High - Low</option>
                </Form.Select>
                <div
                  className='d-none d-md-block border-end border-light'
                  style={{ height: '1.25rem' }}
                />
                {/* <div className='d-none d-sm-block fw-bold text-light opacity-70 text-nowrap ps-md-4'>
                  <i className='fi-switch-horizontal me-2'></i>
                  <span className='align-middle'>Compare (0)</span>
                </div> */}
              </Form.Group>
              <Nav
                activeKey={`/car-finder/catalog?view=${viewParam}`}
                className='d-none d-sm-flex'
              >
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    href='/car-finder/catalog?view=list'
                    className='nav-link-light px-2'
                    aria-label='List view'
                  >
                    <i className='fi-list'></i>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    href='/car-finder/catalog?view=grid'
                    className='nav-link-light px-2'
                    aria-label='grid view'
                  >
                    <i className='fi-grid'></i>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
            {/* Items (Cars) */}
            {!isEmpty(productData) ? (
              viewParam === 'list' ? (
                <div>
                  <InfiniteScroll
                    dataLength={!loading && count}
                    next={fetchData}
                    hasMore={hasMore}
                    // loader={loading}
                    height={750}
                    style={{ overflowX: 'hidden' }}
                  >
                    <Row>
                      {productData.map((car, indx) => (
                        <VehicleCard
                          key={indx}
                          href={`/car-finder/${car?.id}`}
                          images={[
                            [
                              '/images/car-finder/catalog/01.jpg',
                              473,
                              242,
                              'Image',
                              '/car-finder/${product?.id}',
                            ],
                          ]}
                          // images={car.img.map((img, indx) => [img, 'Image'])}
                          title={`${car?.product?.productSpecifications[1]?.specificationValue?.name} ${car?.product?.productSpecifications[0]?.specificationValue?.name}`}
                          year={
                            car?.advertiseSpecifications.filter(
                              (item) =>
                                item?.specificationValue?.specification
                                  ?.slug === 'model-year'
                            )[0]?.specificationValue?.name
                          }
                          price={`${
                            car?.currency?.symbol === null
                              ? '$'
                              : car?.currency?.symbol
                          } ${sumBy(car?.prices, 'amount')}`}
                          location={
                            car?.locationSpecifications[0]?.locationValue?.name
                          }
                          // checkbox={{
                          //   label: 'Compare',
                          //   props: {
                          //     onChange: (e) =>
                          //       e.target.checked
                          //         ? console.log('Car ADDED to comparison list!')
                          //         : console.log(
                          //             'Car REMOVED from comparison list!'
                          //           ),
                          //   },
                          // }}
                          badges={car.badges}
                          wishlistButton={{
                            tooltip: 'Add to Wishlist',
                            props: {
                              onClick: () => {
                                const token = localStorage.getItem('token')
                                if (!token) {
                                  setModelShow(true)
                                } else {
                                  addToWishlist(car)
                                }
                              },
                            },
                          }}
                          footer={[
                            [
                              'fi-dashboard',
                              car?.advertiseSpecifications.filter(
                                (item) =>
                                  item?.specificationValue?.specification
                                    ?.slug === 'mileages'
                              )[0]?.specificationValue?.name,
                            ],
                            [
                              'fi-gearbox',
                              car?.advertiseSpecifications.filter(
                                (item) =>
                                  item?.specificationValue?.specification
                                    ?.slug === 'transmission'
                              )[0]?.specificationValue?.name,
                            ],
                          ]}
                          horizontal
                          light
                          className='mb-4'
                        />
                      ))}
                    </Row>
                  </InfiniteScroll>
                </div>
              ) : (
                <div>
                  <InfiniteScroll
                    dataLength={!loading && count}
                    next={fetchData}
                    hasMore={hasMore}
                    // loader={loading}
                    height={750}
                    style={{ overflowX: 'hidden' }}
                  >
                    <Row>
                      {productData.map((car, indx) => (
                        <Col key={indx} sm={6} className='mb-4'>
                          <VehicleCard
                            href={`/car-finder/${car?.id}`}
                            images={[
                              [
                                '/images/car-finder/catalog/01.jpg',
                                473,
                                242,
                                'Image',
                              ],
                            ]}
                            title={`${car?.product?.productSpecifications[1]?.specificationValue?.name} ${car?.product?.productSpecifications[0]?.specificationValue?.name}`}
                            year={
                              car?.advertiseSpecifications?.filter(
                                (item) =>
                                  item?.specificationValue?.specification
                                    ?.slug === 'model-year'
                              )[0]?.specificationValue?.name
                            }
                            price={`${
                              car?.currency?.symbol === null
                                ? '$'
                                : car?.currency?.symbol
                            } ${sumBy(car?.prices, 'amount')}`}
                            location={
                              car?.locationSpecifications[0]?.locationValue
                                ?.name
                            }
                            // checkbox={{
                            //   label: 'Compare',
                            //   props: {
                            //     onChange: (e) =>
                            //       e.target.checked
                            //         ? console.log(
                            //             'Car ADDED to comparison list!'
                            //           )
                            //         : console.log(
                            //             'Car REMOVED from comparison list!'
                            //           ),
                            //   },
                            // }}
                            badges={car.badges}
                            wishlistButton={{
                              tooltip: 'Add to Wishlist',
                              props: {
                                onClick: () => {
                                  const token = localStorage.getItem('token')
                                  if (!token) {
                                    setModelShow(true)
                                  } else {
                                    addToWishlist(car)
                                  }
                                },
                              },
                            }}
                            footer={[
                              [
                                'fi-dashboard',
                                car?.advertiseSpecifications.filter(
                                  (item) =>
                                    item?.specificationValue?.specification
                                      ?.slug === 'mileages'
                                )[0]?.specificationValue?.name,
                              ],
                              [
                                'fi-gearbox',
                                car?.advertiseSpecifications.filter(
                                  (item) =>
                                    item?.specificationValue?.specification
                                      ?.slug === 'transmission'
                                )[0]?.specificationValue?.name,
                              ],
                            ]}
                            light
                            className='h-100'
                          />
                        </Col>
                      ))}
                      {loading ? (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                          }}
                        >
                          <Spinner animation='border' role='status' />
                        </div>
                      ) : (
                        ''
                      )}
                    </Row>
                  </InfiniteScroll>
                </div>
              )
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
            {/* Sorting + Pagination */}
            <div className='d-flex align-items-center justify-content-between py-2'>
              <Form.Group
                controlId='sortbyBottom'
                className='d-flex align-items-center me-sm-4'
              >
                <Form.Label className='fs-sm fw-normal text-light text-nowrap mb-0 me-2 pe-1'>
                  <i className='fi-arrows-sort mt-n1 me-2'></i>
                  Sort by:
                </Form.Label>
                <Form.Select
                  size='sm'
                  className='form-select-light me-sm-4'
                  onChange={selectOffer}
                >
                  <option value='newest'>Newest</option>
                  <option value='popular'>Popular</option>
                  <option value='priceLH'>Price: Low - High</option>
                  <option value='priceHL'>Price: High - Low</option>
                </Form.Select>
                <div
                  className='d-none d-md-block border-end border-light'
                  style={{ height: '1.25rem' }}
                />
                {/* <div className='d-none d-sm-block fw-bold text-light opacity-70 text-nowrap ps-md-4'>
                  <i className='fi-switch-horizontal me-2'></i>
                  <span className='align-middle'>Compare (0)</span>
                </div> */}
              </Form.Group>
            </div>
          </Col>
          {/* // )} */}
        </Row>
      </Container>

      {/* Filters sidebar toggle button (visible < 991px) */}
      <Button
        size='sm'
        className='w-100 rounded-0 fixed-bottom d-lg-none'
        onClick={handleShow}
      >
        <i className='fi-filter me-2'></i>
        Filters
      </Button>

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

export default CatalogPage
