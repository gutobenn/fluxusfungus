import dynamic from 'next/dynamic';
import React, { Component } from 'react';
import sketch from "../sketches/mycelium";
import { useRouter } from 'next/router'

const P5Wrapper = dynamic(import('react-p5-wrapper'), {
  ssr: false,
});

export default function Sketch({ posts }) {
  const router = useRouter()

  const loadPost = postId => {
    router.push('/?pId=' + postId, '/p/' + postId, { shallow: true })
  }

  return (
    <>
      {/*
      <div>
        {posts.map((post, index) => (
          <Link key={index} href={`/?pcId=${post.id}`} as={`/p/${post.id}`} scroll={false}>
            <a>{post.id} - </a>
          </Link>
        ))}
      </div>
      */}
      <P5Wrapper sketch={sketch} posts={posts} loadPost={loadPost}/>
    </>
  )
}
