import { useEffect } from 'react'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Header from '@/components/header'
import Layout from '@/components/layout'
import { getAllItemsWithId, getItem } from '@/lib/api'
import markdownToHtml from '@/lib/markdownToHtml'
import ContentModal from '@/components/content-modal'
import Head from 'next/head'
import { WEBSITE_NAME } from '@/lib/constants'

export default function Post({ item }) {
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!router.isFallback && !item?.id) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <Layout>
      <Head>
        <title>{WEBSITE_NAME}</title>
      </Head>
      <Header />
      <ContentModal item={item} />
    </Layout>
  )
}

export async function getStaticProps({ params, locale = 'pt' }) {
  const data = await getItem(params.id, locale)
  const rendered_content = await markdownToHtml(
    data?.items[0]?.content[0].content || ''
  )
  const item_type = data?.items[0]?.content[0]?.__typename

  return {
    props: {
      item: {
        ...data?.items[0],
        type: item_type,
        content: {
          ...data?.items[0].content[0],
          content: rendered_content
        }
      }
    }
  }
}

export async function getStaticPaths() {
  const allItems = await getAllItemsWithId('pt') // TODO
  const paths = allItems?.map((item) => `/p/${item.id}` ) || []

  return {
    paths,
    fallback: false
  }
}
