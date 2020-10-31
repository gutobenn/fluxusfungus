import { useRouter } from 'next/router'
import Modal from 'react-modal'
import ReactPlayer from 'react-player/lazy'
import React, {useState} from 'react'
import CloseModal from '@/components/close-modal'

export default function VideoModal(props) {
  const { item } = props
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(true)

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onAfterClose={() => router.push('/')}
        closeTimeoutMS={400}
        contentLabel="Video modal"
        style={{
          overlay: {
            backgroundColor: 'rgba(17, 17, 17, 0.7)'
          },
          content: {
            border: 'none',
            padding: '0',
            margin: '0 auto',
            boxShadow: 'none',
            transform: 'translateY(-40%)',
            maxHeight: '80%',
            maxWidth: '80%',
            height: '700px',
            top: '40%',
            left: '10%',
            right: '10%',
            bottom: 'auto',
            width: '80%',
            backgroundColor: 'transparent'
          }
        }}
      >
        <div className="player-wrapper relative">
          <ReactPlayer
            className="react-player fixed"
            url={item.content.URL}
            width="100%"
            height="100%"
          />
        </div>
      </Modal>
      <CloseModal isOpen={isModalOpen} onClick={() => setIsModalOpen(false)} />
    </>
  )
}
