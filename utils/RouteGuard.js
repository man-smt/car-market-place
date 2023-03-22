import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export { RouteGuard }

function RouteGuard({ children }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const getData = async () => {
      await authCheck(router.asPath)

      const hideContent = () => setAuthorized(false)
      router.events.on('routeChangeStart', hideContent)
      router.events.on('routeChangeComplete', authCheck)

      return () => {
        router.events.off('routeChangeStart', hideContent)
        router.events.off('routeChangeComplete', authCheck)
      }
    }
    getData()
  }, [])

  async function authCheck(url) {
    const privateRoute = ['/car-finder/account-wishlist']
    const path = url.split('?')[0]
    const token = localStorage.getItem('token')

    if (!token && privateRoute.includes(path)) {
      setAuthorized(false)
      router.push({
        pathname: '/car-finder',
      })
    } else {
      setAuthorized(true)
    }
  }

  return authorized && children
}
