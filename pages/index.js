import { useRouter } from 'next/router'
import Layout from '@/components/layout'
import { getAbout, getContaminations, getAllItems } from '@/lib/api'
import shuffleArray from '@/lib/shuffle'
import Head from 'next/head'
import Header from '@/components/header'
import Sketch from '@/components/sketch'
import PostModal from '@/components/post-modal'
import markdownToHtml from '@/lib/markdownToHtml'
import { WEBSITE_NAME } from '@/lib/constants'

export default function Index({ allPosts, aboutPage, contaminationsPage }) {
  const router = useRouter()
  shuffleArray(allPosts)

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
            <PostModal
              isOpen={!!router.query.pId}
              item={allPosts.find((post) => post.id === router.query.pId)}
            />
          )}
          {router.query.page === 'sobre' && (
            <PostModal
              isOpen={router.query.page === 'sobre'}
              item={aboutPage}
            />
          )}
          {router.query.page === 'contaminacoes' && (
            <PostModal
              isOpen={router.query.page === 'contaminacoes'}
              item={contaminationsPage}
            />
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

  // TODO get everything in one query?
}
