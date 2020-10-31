import { useRouter } from 'next/router'
import Modal from 'react-modal'
import CloseModal from '@/components/close-modal'
import React, { useState } from 'react'
import markdownStyles from '@/styles/markdown-styles.module.css'

export default function GenericModal(props) {
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
        contentLabel="Post modal"
        style={{
          overlay: {
            backgroundColor: 'rgba(17, 17, 17, 0.35)'
          },
          content: {
            borderColor: '#e2e8f0',
            boxShadow:
              '0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05)',
            maxWidth: '680px',
            margin: '0 auto',
            transform: 'translateY(-40%)',
            maxHeight: '80%',
            top: '40%',
            left: '10%',
            right: '10%',
            bottom: 'auto',
            width: '80%'
          }
        }}
      >
        {item?.id ? <PostContent item={item} /> : <PageContent item={item} />}
      </Modal>
      <CloseModal isOpen={isModalOpen} onClick={() => setIsModalOpen(false)} />
    </>
  )
}

function PageContent({ item }) {
  return (
    <>
      <h1 className="font-mono">{item.title}</h1>
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: item.content }}
      />
    </>
  )
}

function PostContent({ item }) {
  return (
    <>
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: item.content.content }}
      />
      {item?.content?.author && (
        <div className={'quote-author'}>[{item.content.author}]</div>
      )}
    </>
  )
}
