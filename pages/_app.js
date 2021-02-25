import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { appWithTranslation } from 'next-i18next'
import * as gtag from '../lib/gtag'
import 'react-bnb-gallery/dist/style.css'
import '@/styles/index.scss'

const App = ({ Component, pageProps }) => {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (url !== '/') {
        if (url.startsWith('/p/')) {
          gtag.event({
            action: 'open_post_modal',
            category: 'Content',
            label: url
          })
        } else {
          gtag.event({
            action: 'open_page_modal',
            category: 'Content',
            label: url
          })
        }
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return <Component {...pageProps} />
}

export default appWithTranslation(App)
