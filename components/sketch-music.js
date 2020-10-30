import React, { useState } from 'react'
import ReactPlayer from 'react-player/file'
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa'

export default function SketchMusic({acceptedMusic}) {
  const [isPlaying, setIsPlaying] = useState(acceptedMusic)
  const sketchMusicUrl = process.env.NEXT_PUBLIC_SKETCH_MUSIC

  return (
    <>
      <div
        className={
          'fixed z-2 text-primary bottom-0 left-0 ml-4 mb-2 xl:ml-10 xl:mb-6'
        }
      >
        {isPlaying ? (
          <button onClick={() => setIsPlaying(false)}>
            <FaVolumeUp className={'text-primary'} />
          </button>
        ) : (
          <button onClick={() => setIsPlaying(true)}>
            <FaVolumeMute />
          </button>
        )}
      </div>
      <ReactPlayer
        playing={isPlaying}
        loop={true}
        style={{ display: 'none' }}
        url={sketchMusicUrl}
      />
    </>
  )
}
