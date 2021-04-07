import Head from 'next/head'
import {
  baseURL,
  HOME_OG_IMAGE_URL,
  WEBSITE_NAME,
  WEBSITE_DESCRIPTION_PT,
  WEBSITE_DESCRIPTION_EN
} from '@/lib/constants'
import { useRouter } from 'next/router'

export default function Meta() {
  const router = useRouter()
  router.locale = 'pt'	

  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={ baseURL + "/favicon/apple-touch-icon.png" }
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={ baseURL + "/favicon/favicon-32x32.png" }
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={ baseURL + "/favicon/favicon-16x16.png" }
      />
      <link rel="manifest" href={ baseURL + "/favicon/site.webmanifest" } />
      <link rel="shortcut icon" href={ baseURL + "/favicon/favicon.ico" } />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content={ baseURL + "/favicon/browserconfig.xml" } />
      <meta name="theme-color" content="#000" />
      <meta
        name="viewport"
        content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1"
      />
      <link rel="alternate" type="application/rss+xml" href={baseURL + "/feed.xml"} />
      <meta property="og:title" content={WEBSITE_NAME} />
      {router.locale === 'pt' ? (
        <>
          <meta property="og:description" content={WEBSITE_DESCRIPTION_PT} />
          <meta name="description" content={WEBSITE_DESCRIPTION_PT} />
        </>
      ) : (
        <>
          <meta property="og:description" content={WEBSITE_DESCRIPTION_EN} />
          <meta name="description" content={WEBSITE_DESCRIPTION_EN} />
        </>
      )}
      <meta property="og:image" content={HOME_OG_IMAGE_URL} />
    </Head>
  )
}
