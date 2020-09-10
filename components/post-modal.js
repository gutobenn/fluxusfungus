import React from "react";
import Modal from "react-modal";
import PostContent from "@/components/post-content";
import PageContent from "@/components/page-content";
import {useRouter} from "next/router";

Modal.setAppElement('#__next')

export default function PostModal(props) {
  const router = useRouter()
  const { item } = props
  return (
    <>
      {item && (
      <Modal
        isOpen={true} // The modal should always be shown on page load, it is the 'page'
        onRequestClose={() => router.push('/')}
        contentLabel="Post modal"
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.25)',
          },
          content: {
            borderColor: '#e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05)',
            maxWidth: '900px',
            margin: '0 auto',
          }
        }}
        {...props}
      >
        {item?.id ?
          (<PostContent item={item} />)
          :(<PageContent item={item} />)
        }
      </Modal>
      )}
    </>
  )
}
