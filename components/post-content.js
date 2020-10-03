import markdownStyles from './markdown-styles.module.css'
import React from 'react'

export default function PostContent({ item }) {
  return (
    <>
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: item.content.content }}
      />
      {item?.content?.author && <div>[{item.content.author}]</div>}
    </>
  )
}
