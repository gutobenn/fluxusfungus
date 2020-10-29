import dynamic from 'next/dynamic'
import React, { useState } from 'react'
import ReactPlayer from 'react-player/file'
import myceliumSketch from '../sketches/mycelium'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'
import shuffleArray from '@/lib/shuffle'

const P5Wrapper = dynamic(import('react-p5-wrapper'), {
  ssr: false
})

export default function Sketch({ posts }) {
  const numberOfPosts = 10
  const router = useRouter()
  const [page, setPage] = useState(0)

  const showPost = (postId) => {
    router.push('/?pId=' + postId, '/p/' + postId, { shallow: true })
  }

  const nextPage = () => {
    setPage(page + 1)

    gtag.event({
      action: 'next_page',
      category: 'Content',
      label: page
    })
  }

  shuffleArray(posts)
  let postsToDisplay = posts.slice(
    page * numberOfPosts,
    (page + 1) * numberOfPosts
  )

  return (
    <>
      <ReactPlayer
        playing
        loop={true}
        width="100px"
        height="auto"
        controls={true}
        style={{ position: 'fixed', left: '0', bottom: '0' }}
        url="https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3"
      />
      <div className={'sketch-wrapper'}>
        <P5Wrapper
          sketch={myceliumSketch}
          posts={postsToDisplay}
          showPost={showPost}
          hasNextPage={posts.length > (page + 1) * numberOfPosts}
          nextPage={nextPage}
          key={'mycelium_sketch_posts_' + page}
        />
      </div>
    </>
  )
}
