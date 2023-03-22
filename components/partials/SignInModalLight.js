import { useState } from 'react'
import Link from 'next/link'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import CloseButton from 'react-bootstrap/CloseButton'
import ImageLoader from '../ImageLoader'
import PasswordToggle from '../PasswordToggle'

const SignInModalLight = ({ onSwap, pillButtons, ...props }) => {
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

  return (
    <Modal {...props} className='signin-modal'>
      <Modal.Body className='px-0 py-2 py-sm-0'>
        <CloseButton
          onClick={props.onHide}
          aria-label='Close modal'
          className='position-absolute top-0 end-0 mt-3 me-3'
        />
        <div className='row mx-0 align-items-center'>
          <div className='col-md-6 border-end-md p-4 p-sm-5'>
            <h2 className='h3 mb-4 mb-sm-5'>
              Hey there!
              <br />
              Welcome back.
            </h2>
            <div className='d-flex justify-content-center'>
              <ImageLoader
                src='/images/signin-modal/signin.svg'
                width={344}
                height={292}
                alt='Illusration'
              />
            </div>
            <div className='mt-4 mt-sm-5'>
              Don&apos;t have an account?{' '}
              <a href='#' onClick={onSwap}>
                Sign up here
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
              <hr className='w-100' />
              <div className='px-3'>Or</div>
              <hr className='w-100' />
            </div>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group controlId='si-email' className='mb-4'>
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='Enter your email'
                  required
                />
              </Form.Group>
              <Form.Group className='mb-4'>
                <div className='d-flex align-items-center justify-content-between mb-2'>
                  <Form.Label htmlFor='si-password' className='mb-0'>
                    Password
                  </Form.Label>
                  <Link href='#' className='fs-sm'>
                    Forgot password?
                  </Link>
                </div>
                <PasswordToggle
                  id='si-password'
                  placeholder='Enter password'
                  required
                />
              </Form.Group>
              <Button
                type='submit'
                size='lg'
                variant={`primary ${pillButtons ? 'rounded-pill' : ''} w-100`}
              >
                Sign in
              </Button>
            </Form>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default SignInModalLight