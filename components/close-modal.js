import React from 'react'
import { useRouter } from 'next/router'

export default function CloseModal() {
  const router = useRouter()

  return (
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
  )
}
