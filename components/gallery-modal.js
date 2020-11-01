import { useRouter } from 'next/router'
import ReactBnbGallery from 'react-bnb-gallery'
import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import Modal from "react-modal";

export default function GalleryModal(props) {
  const { item } = props
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <CSSTransition
      in={isLoaded}
      timeout={400}
      classNames="fluxus-gallery-animation"
      onExited={() => router.push('/')}
    >
      <ReactBnbGallery
        show={true}
        wrap={true}
        opacity={0.7}
        backgroundColor={'#111'}
        photos={item.content.Picture.map((picture) => {
          return {
            photo: picture.image.formats?.large?.url ?? picture.image.url, // For GIF images the 'formats' returned is an empty object, so we fallback to image.url
            thumbnail:
              picture.image.formats?.thumbnail?.url ?? picture.image.url,
            caption: picture.caption,
            subcaption: picture.subcaption
          }
        })}
        onClose={() => setIsLoaded(false)}
      />
    </CSSTransition>
  )
}
