import { useEffect, useState } from 'react'
import Link from 'next/link'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import CloseButton from 'react-bootstrap/CloseButton'
import ImageLoader from '../ImageLoader'
import client from '../../apollo'
import { SIGNUP } from '../../graphql/Mutations'
import { toast, ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

const SignUpModalDark = ({
  onSwap,
  pillButtons,
  setSignupShow,
  setSigninShow,
  ...props
}) => {
  // Form validation
  const [validated, setValidated] = useState(false)
  const [signUpData, setSignUpData] = useState({})
  const [show, setShow] = useState(false)
  const [error, setError] = useState([])
  const [passwordError, setPasswordError] = useState(false)
  const [checkBox, setCheckBox] = useState(false)

  const [displayError, setDisplayError] = useState({})

  const handleData = (e) => {
    setPasswordError(false)
    const { name, value } = e.target
    setSignUpData((currEle) => {
      return { ...currEle, [name]: value }
    })
    setShow(false)
  }

  // useEffect(() => {
  //   let obj = displayError
  //   error?.errors?.map((error) => {
  //     if (error?.message?.includes('Name')) {
  //       obj.name = error?.message
  //     }
  //     if (error?.message?.includes('Surname')) {
  //       obj.surname = error?.message
  //     }
  //     if (error?.message?.includes('Email')) {
  //       obj.email = error?.message
  //     }
  //     if (error?.message?.includes('Password')) {
  //       obj.password = error?.message
  //     }
  //     setDisplayError(obj)
  //   })
  // }, [error.errors])

  const handleSubmit = (event) => {
    setDisplayError({})
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setPasswordError(true)
      return false
    } else {
      setPasswordError(false)
    }

    setValidated(true)
    client
      .mutate({ mutation: SIGNUP, variables: { input: signUpData } })
      .then((res) => {
        setSignupShow(false)
        setSigninShow(true)
        toast.success('User Signup successfully')
      })
      .catch((err) => {
        if (err.message.includes('Failed to fetch')) {
          console.log({ err: err })
          setShow(true)
          setError('Network error')
        } else {
          setShow(true)
          setError(err?.networkError?.result)

          let obj = {}
          err?.networkError?.result?.errors?.map((error) => {
            if (error?.message?.includes('Name')) {
              obj.name = error?.message
            }
            if (error?.message?.includes('Surname')) {
              obj.surname = error?.message
            }
            if (error?.message?.includes('Email')) {
              obj.email = error?.message
            }
            if (error?.message?.includes('Password')) {
              obj.password = error?.message
            }
          })
          setDisplayError(obj)
        }
      })
  }
  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal
          {...props}
          className='signup-modal'
          contentClassName='bg-dark border-light'
        >
          {/* {show && <Alert variant={'danger'}>{error}</Alert>} */}
          <Modal.Body className='px-0 py-2 py-sm-0'>
            <CloseButton
              variant='white'
              onClick={props.onHide}
              aria-label='Close modal'
              className='position-absolute top-0 end-0 mt-3 me-3'
            />

            <div className='row mx-0 align-items-center'>
              <div className='col-md-6 border-end-md border-light p-4 p-sm-5'>
                <h2 className='h3 text-light mb-4 mb-sm-5'>
                  Join Finder.
                  <br />
                  Get premium benefits:
                </h2>
                <ul className='text-light list-unstyled mb-4 mb-sm-5'>
                  <li className='d-flex mb-2'>
                    <i className='fi-check-circle text-primary mt-1 me-2'></i>
                    <span>Add and promote your listings</span>
                  </li>
                  <li className='d-flex mb-2'>
                    <i className='fi-check-circle text-primary mt-1 me-2'></i>
                    <span>Easily manage your wishlist</span>
                  </li>
                  <li className='d-flex mb-0'>
                    <i className='fi-check-circle text-primary mt-1 me-2'></i>
                    <span>Leave reviews</span>
                  </li>
                </ul>
                <div className='d-flex justify-content-center'>
                  <ImageLoader
                    src='/images/signin-modal/signup-dark.svg'
                    width={344}
                    height={404}
                    alt='Illusration'
                  />
                </div>
                <div className='text-light mt-sm-4 pt-md-3'>
                  <span className='opacity-60'>Already have an account?</span>{' '}
                  <a href='#' className='text-light' onClick={onSwap}>
                    Sign in
                  </a>
                </div>
              </div>
              <div className='col-md-6 px-4 pt-2 pb-4 px-sm-5 pb-sm-5 pt-md-5'>
                <Button
                  variant={`outline-info ${
                    pillButtons ? 'rounded-pill' : ''
                  } w-100 mb-3`}
                >
                  <i className='fi-google fs-lg me-1'></i>
                  Sign in with Google
                </Button>
                <Button
                  variant={`outline-info ${
                    pillButtons ? 'rounded-pill' : ''
                  } w-100 mb-3`}
                >
                  <i className='fi-facebook fs-lg me-1'></i>
                  Sign in with Facebook
                </Button>
                <div className='d-flex align-items-center py-3 mb-3'>
                  <hr className='hr-light w-100' />
                  <div className='text-light opacity-70 px-3'>Or</div>
                  <hr className='hr-light w-100' />
                </div>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group controlId='su-name' className='mb-4'>
                    <Form.Label className='text-light'>Name</Form.Label>
                    <Form.Control
                      name='name'
                      onChange={(e) => handleData(e)}
                      placeholder='Enter your Name'
                      className='form-control-light'
                      required
                    />
                    {show && (
                      <div style={{ color: '#F23C49' }}>
                        {/* <p>{error.errors[0]?.message}</p> */}
                        {displayError?.name && <p> {displayError?.name} </p>}
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group controlId='su-surname' className='mb-4'>
                    <Form.Label className='text-light'>Surname</Form.Label>
                    <Form.Control
                      name='surname'
                      onChange={(e) => handleData(e)}
                      placeholder='Enter your Surname'
                      className='form-control-light'
                      required
                    />
                    {show && (
                      <div style={{ color: '#F23C49' }}>
                        {/* <p>{error.errors[1]?.message}</p> */}
                        {displayError?.surname && (
                          <p> {displayError?.surname} </p>
                        )}
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group controlId='su-email' className='mb-4'>
                    <Form.Label className='text-light'>
                      Email address
                    </Form.Label>
                    <Form.Control
                      name='email'
                      onChange={(e) => handleData(e)}
                      type='email'
                      placeholder='Enter your email'
                      className='form-control-light'
                      required
                    />
                    {/* &nbsp; */}
                    {show && (
                      <div style={{ color: '#F23C49' }}>
                        {/* <p>{error.errors[2]?.message}</p> */}
                        {displayError?.email && <p> {displayError?.email} </p>}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group controlId='su-password' className='mb-4'>
                    <Form.Label className='text-light'>Password</Form.Label>
                    <Form.Control
                      name='password'
                      onChange={(e) => handleData(e)}
                      type='password'
                      placeholder='Enter your password'
                      className='form-control-light'
                      required
                    />
                    {show && (
                      <div style={{ color: '#F23C49' }}>
                        {/* <p>{error.errors[3]?.message}</p> */}
                        {displayError?.password && (
                          <p> {displayError?.password} </p>
                        )}
                      </div>
                    )}
                    {!!passwordError && (
                      <span className='p-2 d-flex align-items-center border-0 bg-transparent text-danger'>
                        Password are not match
                      </span>
                    )}
                  </Form.Group>

                  <Form.Group className='mb-4'>
                    <Form.Label
                      className='text-light'
                      htmlFor='su-confirm-password'
                    >
                      Confirm password
                    </Form.Label>
                    <Form.Control
                      name='confirmPassword'
                      onChange={(e) => handleData(e)}
                      type='password'
                      placeholder='Enter your password'
                      id='su-confirm-password'
                      minLength='8'
                      className='form-control-light'
                      required
                    />
                    {show && (
                      <div style={{ color: '#F23C49' }}>
                        {/* <p>{error.errors[3]?.message}</p> */}
                        {displayError?.password && (
                          <p> {displayError?.password} </p>
                        )}
                      </div>
                    )}
                    {!!passwordError && (
                      <span className='p-2 d-flex align-items-center border-0 bg-transparent text-danger'>
                        Password are not match
                      </span>
                    )}
                  </Form.Group>
                  <Form.Check
                    type='checkbox'
                    id='terms-agree'
                    onClick={(e) => {
                      setCheckBox(e.target.checked)
                    }}
                    label={[
                      <span key={1} className='opacity-70'>
                        By joining, I agree to the
                      </span>,
                      <Link key={2} href='#' className='text-light'>
                        Terms of use
                      </Link>,
                      <span key={3} className='opacity-70'>
                        and
                      </span>,
                      <Link key={4} href='#' className='text-light'>
                        Privacy policy
                      </Link>,
                    ]}
                    required
                    className='form-check-light mb-4'
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!checkBox ? true : false}
                    type='button'
                    size='lg'
                    variant={`primary ${
                      pillButtons ? 'rounded-pill' : ''
                    } w-100`}
                  >
                    Sign up
                  </Button>
                </Form>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        <ToastContainer />
      </Form>
    </>
  )
}

export default SignUpModalDark
