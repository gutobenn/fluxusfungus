import React from 'react'
import Modal from 'react-modal'
import GalleryModal from '@/components/gallery-modal'
import VideoModal from '@/components/video-modal'
import GenericModal from '@/components/generic-modal'

Modal.setAppElement('#__next')

export default function ContentModal(props) {
  const { item } = props

  if (item) {
    switch (item.type) {
      case 'ComponentPagesVideo':
        return <VideoModal item={item} />
      case 'ComponentPagesGallery':
        return <GalleryModal item={item} />
      case 'ComponentPagesQuote':
      case 'AboutPage':
      case 'ContaminationsPage':
        return <GenericModal item={item} />
    }
  }

  return null
}
