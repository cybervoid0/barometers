'use client'

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
      <source src="/videos/Baro_small.mp4" type="video/mp4" />
    </video>
  )
}
