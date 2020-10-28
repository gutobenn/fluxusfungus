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

export default function Index({ allPosts, aboutPage, contaminationsPage }) {
  const router = useRouter()

  useEffect(() => {
    gtag.pageview('/')
  })

  return (
    <>
      <Layout>
        <Head>
          <title>{WEBSITE_NAME}</title>
        </Head>
        <Header />
        <div className="container m-0">
          <Sketch posts={allPosts} />
          {router.query.pId && (
            <ContentModal
              item={allPosts.find((post) => post.id === router.query.pId)}
            />
          )}
          {router.query.page === 'sobre' && <ContentModal item={aboutPage} />}
          {router.query.page === 'contaminacoes' && (
            <ContentModal item={contaminationsPage} />
          )}
        </div>
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const allPostsQuery = (await getAllItems()) || []
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
  const aboutPageQuery = await getAbout()
  const aboutContent = await markdownToHtml(aboutPageQuery.about.content || '')
  const aboutPage = { ...aboutPageQuery, content: aboutContent }

  const contaminationsPageQuery = await getContaminations()
  const contaminationsContent = await markdownToHtml(
    contaminationsPageQuery.contamination.content || ''
  )
  const contaminationsPage = {
    ...contaminationsPageQuery,
    content: contaminationsContent
  }

  return {
    props: { allPosts, aboutPage, contaminationsPage }
  }
}
