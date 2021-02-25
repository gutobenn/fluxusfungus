import Layout from '@/components/layout'
import Head from 'next/head'
import Header from '@/components/header'
import { getAbout } from '@/lib/api'
import markdownToHtml from '@/lib/markdownToHtml'
import ContentModal from '@/components/content-modal'
import { WEBSITE_NAME } from '@/lib/constants'

export default function About({ page }) {
  return (
    <>
      <Layout>
        <Head>
          <title>
            {page.title} - {WEBSITE_NAME}
          </title>
        </Head>
        <Header />
        <ContentModal item={page} />
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const page = await getAbout('en')
  const content = await markdownToHtml(page.about.content || '')

  return {
    props: {
      page: {
        ...page,
        content
      }
    }
  }
}
