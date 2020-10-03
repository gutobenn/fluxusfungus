import markdownStyles from './markdown-styles.module.css'
import React from "react";
import { Carousel } from 'react-responsive-carousel';

export default function PostContent({ item }) {
  return (
    <>
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: item.content.content }}
      />
      { item?.content?.author && <div>[{item.content.author}]</div> }
    </>
  )
}

