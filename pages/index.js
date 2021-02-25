import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout'
import { getAbout, getContaminations, getAllItems } from '@/lib/api'
import Head from 'next/head'
import Header from '@/components/header'
import Sketch from '@/components/sketch'
import ContentModal from '@/components/content-modal'
import markdownToHtml from '@/lib/markdownToHtml'
import { WEBSITE_NAME } from '@/lib/constants'
import * as gtag from '@/lib/gtag'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Index({ allPosts, aboutPage, contaminationsPage }) {
  const router = useRouter()

  useEffect(() => {
    gtag.pageview('/')
  }, [])

  return (
    <Layout>
      <Head>
        <title>{WEBSITE_NAME}</title>
      </Head>
      <Header />
      <div className="my-0 mx-auto">
        <Sketch allPosts={allPosts} />
        {router.query.pId && (
          <ContentModal
            item={allPosts.find((post) => post.id === router.query.pId)}
          />
        )}
        {(router.query.page === 'sobre' || router.query.page === 'about') && <ContentModal item={aboutPage} />}
        {(router.query.page === 'contaminacoes' || router.query.page === 'contaminations') && (
          <ContentModal item={contaminationsPage} />
        )}
      </div>
    </Layout>
  )
}

export async function getStaticProps({ locale }) {
  const allPostsQuery = (await getAllItems(locale)) || []
  const pArray = allPostsQuery.map(async (post) => {
    const rendered_content = await markdownToHtml(
      post.content[0]?.content || ''
    )

    const item_type = post.content[0]?.__typename

    return {
      ...post,
      type: item_type,
      content: {
        ...post.content[0],
        content: rendered_content
      }
    }
  })

  const allPosts = await Promise.all(pArray)

  // TODO get everything in one query?
  const aboutPageQuery = await getAbout(locale)
  const aboutContent = await markdownToHtml(aboutPageQuery.about.content || '')
  const aboutPage = { ...aboutPageQuery, content: aboutContent }

  const contaminationsPageQuery = await getContaminations(locale)
  const contaminationsContent = await markdownToHtml(
    contaminationsPageQuery.contamination.content || ''
  )
  const contaminationsPage = {
    ...contaminationsPageQuery,
    content: contaminationsContent
  }

  return {
    props: {
      allPosts,
      aboutPage,
      contaminationsPage,
      ...await serverSideTranslations(locale, ['common'])
    }
  }
}
