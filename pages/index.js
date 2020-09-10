import { useRouter } from 'next/router'
import Layout from '@/components/layout'
import {getAbout, getAllItems} from '@/lib/api'
import shuffleArray from '@/lib/shuffle'
import Head from 'next/head'
import Header from "@/components/header";
import Sketch from "@/components/sketch";
import PostModal from "@/components/post-modal";
import markdownToHtml from "@/lib/markdownToHtml";
import { WEBSITE_NAME } from '@/lib/constants'

export default function Index({ allPosts, aboutPage }) {
  const router = useRouter()
  shuffleArray(allPosts)
  const sketchPosts = allPosts.slice(0,3);

  return (
    <>
      <Layout>
        <Head>
          <title>{WEBSITE_NAME}</title>
        </Head>
        <Header />
        <div className="container m-0">
          <Sketch posts={sketchPosts}/>
          {router.query.pId &&
          <PostModal
            isOpen={!!router.query.pId}
            item={allPosts.find(post => post.id === router.query.pId)} />
          }
          {router.query.page === 'sobre' &&
          <PostModal
            isOpen={router.query.page === 'sobre'}
            item={aboutPage} />
          }
        </div>
      </Layout>
    </>
  )
}

export async function getStaticProps({ }) {
  const allPostsQuery = (await getAllItems()) || []
  const pArray = allPostsQuery.map(async post => {
    const content = await markdownToHtml(post.content || '')
    return { ...post, content }
  });
  const allPosts = await Promise.all(pArray);

  const aboutPageQuery = await getAbout()
  const aboutContent = await markdownToHtml(aboutPageQuery.about.content || '')
  const aboutPage = {...aboutPageQuery, content: aboutContent}

  return {
    props: { allPosts, aboutPage },
  }

  // TODO get everything in one query?
}
