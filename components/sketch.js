import dynamic from 'next/dynamic'
import React, { useState, useEffect } from 'react'
import myceliumSketch from '../sketches/mycelium'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'
import shuffleArray from '@/lib/shuffle'
import SketchMusic from '@/components/sketch-music'
import { CSSTransition } from 'react-transition-group'

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
      action: 'next_page',
      category: 'Content',
      label: newPage
    })
  }

  const goToFirstPage = () => {
    setCurrentPage(0)

    shufflePosts()

    gtag.event({
      action: 'back_to_first_page',
      category: 'Content',
      label: '0'
    })
  }

  return (
    <>
      {acceptedMusic === null ? (
        <AcceptMusicBox
          onReject={() => setAcceptedMusic(false)}
          onAccept={() => setAcceptedMusic(true)}
        />
      ) : (
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

function AcceptMusicBox({ onAccept, onReject }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <CSSTransition
      in={isLoaded}
      timeout={2100}
      classNames="fluxus-fade-in-600-wait-1500"
    >
      <div className="flex items-center justify-center h-screen opacity-0">
        <div className="font-mono text-center xl:pl-64 xl:pb-32">
          <div className="px-6 bg-white py-2 px-6 shadow-md">quer som?</div>
          <div className="inline-flex shadow-md">
            <button
              onClick={onReject}
              className="bg-black hover:bg-white text-white hover:text-black hover:shadow-inner py-1 px-6"
            >
              não
            </button>
            <button
              onClick={onAccept}
              className="bg-black hover:bg-white text-white hover:text-black hover:shadow-inner py-1 px-6 border-left-1px"
            >
              sim
            </button>
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}
