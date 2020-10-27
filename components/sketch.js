import dynamic from 'next/dynamic'
import React, { useState } from 'react'
import myceliumSketch from '../sketches/mycelium'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'

const P5Wrapper = dynamic(import('react-p5-wrapper'), {
  ssr: false
})

export default function Sketch({ posts }) {
  const numberOfPosts = 10
  const router = useRouter()
  const [count, setCount] = useState(0)

  const loadPost = (postId) => {
    router.push('/?pId=' + postId, '/p/' + postId, { shallow: true })
  }

  const increaseCount = () => {
    setCount(count + 1)

    gtag.event({
      action: 'next_mycelium',
      category: 'Content',
      label: count
    })
  }

  let postsToDisplay = posts.slice(
    count * numberOfPosts,
    (count + 1) * numberOfPosts
  )

  return (
    <P5Wrapper
      sketch={myceliumSketch}
      posts={postsToDisplay}
      loadPost={loadPost}
      hasNextPage={posts.length > (count + 1) * numberOfPosts}
      increaseCount={increaseCount}
      key={'mycelium_sketch_posts_' + count}
    />
  )
}
