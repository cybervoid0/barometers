'use client'

import { googleStorageImagesFolder } from '@/utils/constants'
import sx from './styles.module.scss'

export function FooterVideo() {
  return (
    <video
      playsInline
      autoPlay
      loop
      muted
      className={sx.video}
      onContextMenu={e => {
        e.preventDefault()
      }}
    >
      <source src={`${googleStorageImagesFolder}shared/Baro_small.mp4`} type="video/mp4" />
    </video>
  )
}
