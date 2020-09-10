import { useEffect } from 'react'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Header from '@/components/header'
import Layout from '@/components/layout'
import { getAllItemsWithId, getItem } from '@/lib/api'
import markdownToHtml from '@/lib/markdownToHtml'
import PostModal from "@/components/post-modal";
import Head from "next/head";
import {WEBSITE_NAME} from "@/lib/constants";

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
      <PostModal
        item={item}
      />
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const data = await getItem(params.id)
  const content = await markdownToHtml(data?.items[0]?.content || '')

  return {
    props: {
      item: {
        ...data?.items[0],
        content,
      },
    },
  }
}

export async function getStaticPaths() {
  const allItems = await getAllItemsWithId()
  return {
    paths: allItems?.map((item) => `/p/${item.id}`) || [],
    fallback: true,
  }
}
