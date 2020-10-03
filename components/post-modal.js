import React from 'react'
import Modal from 'react-modal'
import ReactBnbGallery from 'react-bnb-gallery'
import PostContent from '@/components/post-content'
import PageContent from '@/components/page-content'
import { useRouter } from 'next/router'

Modal.setAppElement('#__next')

export default function PostModal(props) {
  const router = useRouter()
  const { item } = props
  return (
    <>
      {item && item.type === 'ComponentPagesGallery' && (
        <ReactBnbGallery
          show={true}
          wrap={true}
          photos={item.content.Picture.map((picture) => {
            return {
              photo: picture.image.formats.large.url,
              caption: picture.caption,
              subcaption: picture.subcaption
            }
          })}
          onClose={() => router.push('/')}
        />
      )}
      {item &&
        (item.type === 'ComponentPagesQuote' || item.type === 'AboutPage') && (
          <Modal
            isOpen={true} // The modal should always be shown on page load, it is the 'page'
            onRequestClose={() => router.push('/')}
            contentLabel="Post modal"
            style={{
              overlay: {
                backgroundColor: 'rgba(0,0,0,0.25)'
              },
              content: {
                borderColor: '#e2e8f0',
                boxShadow:
                  '0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05)',
                maxWidth: '900px',
                margin: '0 auto'
              }
            }}
            {...props}
          >
            {item?.id ? (
              <PostContent item={item} />
            ) : (
              <PageContent item={item} />
            )}
            <div
              className="cursor-pointer z-50 absolute top-0 right-0 mt-4 mr-4"
              onClick={() => router.push('/')}
            >
              <svg
                className="fill-current text-black"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
              </svg>
            </div>
          </Modal>
        )}
    </>
  )
}
