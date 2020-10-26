import React from 'react'
import Modal from 'react-modal'
import ReactBnbGallery from 'react-bnb-gallery'
import ReactPlayer from 'react-player/lazy'
import PostContent from '@/components/post-content'
import PageContent from '@/components/page-content'
import { useRouter } from 'next/router'

Modal.setAppElement('#__next')

export default function PostModal(props) {
  const router = useRouter()
  const { item } = props
  return (
    <>
      {item && item.type === 'ComponentPagesVideo' && (
        <>
          <Modal
            isOpen={true} // The modal should always be shown on page load, it is the 'page'
            onRequestClose={() => router.push('/')}
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
            {...props}
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
          <div
            className="cursor-pointer z-50 fixed top-0 right-0 mt-6 mr-6"
            onClick={() => router.push('/')}
          >
            <svg
              className="fill-current text-white"
              xmlns="http://www.w3.org/2000/svg"
              width="2em"
              height="2em"
              viewBox="0 0 24 24"
            >
              <path d="m23.25 24c-.19 0-.38-.07-.53-.22l-10.72-10.72-10.72 10.72c-.29.29-.77.29-1.06 0s-.29-.77 0-1.06l10.72-10.72-10.72-10.72c-.29-.29-.29-.77 0-1.06s.77-.29 1.06 0l10.72 10.72 10.72-10.72c.29-.29.77-.29 1.06 0s .29.77 0 1.06l-10.72 10.72 10.72 10.72c.29.29.29.77 0 1.06-.15.15-.34.22-.53.22"></path>
            </svg>
          </div>
        </>
      )}
      {item && item.type === 'ComponentPagesGallery' && (
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
      )}
      {item &&
        (item.type === 'ComponentPagesQuote' ||
          item.type === 'AboutPage' ||
          item.type === 'ContaminationsPage') && (
          <>
            <Modal
              isOpen={true} // The modal should always be shown on page load, it is the 'page'
              onRequestClose={() => router.push('/')}
              contentLabel="Post modal"
              style={{
                overlay: {
                  backgroundColor: 'rgba(17, 17, 17, 0.35)'
                },
                content: {
                  borderColor: '#e2e8f0',
                  boxShadow:
                    '0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05)',
                  maxWidth: '600px',
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
              {...props}
            >
              {item?.id ? (
                <PostContent item={item} />
              ) : (
                <PageContent item={item} />
              )}
            </Modal>
            <div
              className="cursor-pointer z-50 fixed top-0 right-0 mt-6 mr-6"
              onClick={() => router.push('/')}
            >
              <svg
                className="fill-current text-white"
                xmlns="http://www.w3.org/2000/svg"
                width="2em"
                height="2em"
                viewBox="0 0 24 24"
              >
                <path d="m23.25 24c-.19 0-.38-.07-.53-.22l-10.72-10.72-10.72 10.72c-.29.29-.77.29-1.06 0s-.29-.77 0-1.06l10.72-10.72-10.72-10.72c-.29-.29-.29-.77 0-1.06s.77-.29 1.06 0l10.72 10.72 10.72-10.72c.29-.29.77-.29 1.06 0s .29.77 0 1.06l-10.72 10.72 10.72 10.72c.29.29.29.77 0 1.06-.15.15-.34.22-.53.22"></path>
              </svg>
            </div>
          </>
        )}
    </>
  )
}