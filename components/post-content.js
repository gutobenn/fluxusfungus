import markdownStyles from './markdown-styles.module.css'
import React from "react";

export default function PostContent({ item }) {
  console.log(item);
  return (
    <>
      <div>{item.title}</div>
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: item.content }}
      />
      <div>{item.author}</div>
    </>
  )
}

