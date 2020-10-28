import { useRouter } from 'next/router'
import ReactBnbGallery from 'react-bnb-gallery'
import React from 'react'

export default function GalleryModal(props) {
  const { item } = props
  const router = useRouter()

  return (
    <ReactBnbGallery
      show={true}
      wrap={true}
      opacity={0.7}
      backgroundColor={'#111'}
      photos={item.content.Picture.map((picture) => {
        return {
          photo: picture.image.formats.large.url,
          thumbnail: picture.image.formats.thumbnail.url,
          caption: picture.caption,
          subcaption: picture.subcaption
        }
      })}
      onClose={() => router.push('/')}
    />
  )
}
