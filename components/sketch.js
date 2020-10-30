import dynamic from 'next/dynamic'
import React, { useState, useEffect } from 'react'
import myceliumSketch from '../sketches/mycelium'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'
import shuffleArray from '@/lib/shuffle'
import SketchMusic from '@/components/sketch-music'

const P5Wrapper = dynamic(import('react-p5-wrapper'), {
  ssr: false
})

export default function Sketch({ allPosts }) {
  const numberOfPosts = 10
  const router = useRouter()
  const [posts, setPosts] = useState(allPosts)
  const [currentPage, setCurrentPage] = useState(0)
  const [acceptedMusic, setAcceptedMusic] = useState(null)

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
      {acceptedMusic === null && (
        <div className="font-mono text-center w-full h-full flex flex-row fixed items-center">
          <div className="flex flex-col items-center mx-auto my-0 xl:pl-64 xl:pb-32">
            <div className="px-6 bg-white py-2 px-6">
              quer experimentar o som de project mycelium?
            </div>
            <div className="inline-flex mt-4">
              <button
                onClick={() => setAcceptedMusic(false)}
                className="bg-black hover:bg-white text-white hover:text-black py-1 px-6"
              >
                não
              </button>
              <button
                onClick={() => setAcceptedMusic(true)}
                className="bg-black hover:bg-white text-white hover:text-black py-1 px-6 ml-10"
              >
                sim
              </button>
            </div>
          </div>
        </div>
      )}
      {posts.length > 0 && acceptedMusic !== null && (
        <>
          <SketchMusic acceptedMusic={acceptedMusic} />
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
        </>
      )}
    </>
  )
}
