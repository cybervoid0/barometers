'use client'

import { imageStorage } from '@/utils/constants'

export function FooterVideo() {
  return (
    <video
      playsInline
      autoPlay
      loop
      muted
      className="mt-20 h-[80vw] w-full object-cover object-[30%_56%] xs:mt-12 xs:h-[180px] xs:object-[100%_56%]"
      onContextMenu={e => {
        e.preventDefault()
      }}
    >
      <source src={`${imageStorage}shared/Baro_small.mp4`} type="video/mp4" />
    </video>
  )
}
