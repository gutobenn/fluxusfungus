import markdownStyles from './markdown-styles.module.css'
import React from "react";

export default function PageContent({ item }) {
  return (
    <>
      <h1>{item.title}</h1>
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: item.content }}
      />
    </>
  )
}

