import markdownStyles from './markdown-styles.module.css'
import React from 'react'

export default function PostContent({ item }) {
  return (
    <>
      <div
        className={(markdownStyles['markdown'], 'quote-content')}
        dangerouslySetInnerHTML={{ __html: item.content.content }}
      />
      {item?.content?.author && (
        <div className={'quote-author'}>[{item.content.author}]</div>
      )}
    </>
  )
}
