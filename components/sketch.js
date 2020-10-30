import dynamic from 'next/dynamic'
import React, { useState, useEffect } from 'react'
import ReactPlayer from 'react-player/file'
import myceliumSketch from '../sketches/mycelium'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'
import shuffleArray from '@/lib/shuffle'

const P5Wrapper = dynamic(import('react-p5-wrapper'), {
  ssr: false
})

export default function Sketch({ allPosts }) {
  const numberOfPosts = 10
  const router = useRouter()
  const [posts, setPosts] = useState(allPosts)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    shufflePosts()
  }, [])

  const shufflePosts = () => {
    let allPostsCopy = JSON.parse(JSON.stringify(allPosts))
    shuffleArray(allPostsCopy)
    setPosts(allPostsCopy)
  }

  const showPost = (postId) => {
    router.push('/?pId=' + postId, '/p/' + postId, { shallow: true })
  }

  const nextPage = () => {
    let newPage = currentPage + 1

    setCurrentPage(newPage)

    gtag.event({
      action: 'next_currentPage',
      category: 'Content',
      label: newPage
    })
  }

  const goToFirstPage = () => {
    setCurrentPage(0)

    shufflePosts()

    gtag.event({
      action: 'back_to_first_currentPage',
      category: 'Content',
      label: '0'
    })
  }

  return (
    <>
      <ReactPlayer
        loop={true}
        width="100px"
        height="50px"
        controls={true}
        style={{ position: 'fixed', left: '0', bottom: '0' }}
        url="https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3"
      />
      {posts.length > 0 && (
        <P5Wrapper
          sketch={myceliumSketch}
          posts={posts.slice(
            currentPage * numberOfPosts,
            (currentPage + 1) * numberOfPosts
          )}
          showPost={showPost}
          hasNextPage={posts.length > (currentPage + 1) * numberOfPosts}
          nextPage={nextPage}
          goToFirstPage={goToFirstPage}
          key={'mycelium_sketch_posts_' + currentPage}
        />
      )}
    </>
  )
}
