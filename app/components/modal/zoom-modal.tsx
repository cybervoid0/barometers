'use client'

import { CloseButton } from '@mantine/core'
import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useClickOutside } from '@mantine/hooks'
import { useScrollLock } from '@/app/hooks/useScrollLock'

interface ZoomModalProps {
  isOpened: boolean
  close: () => void
  children: (props: { onLoad: () => void }) => ReactNode
}

export function ZoomModal({ children, close, isOpened }: ZoomModalProps) {
  const [mounted, setMounted] = useState(false)
  const childrenContainer = useClickOutside(close)
  const [imageLoaded, setImageLoaded] = useState(false)

  // the component is rendered on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  // setting scroll lock if the modal is opened
  useScrollLock(isOpened)

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpened && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0, backgroundColor: 'rgba(0,0,0,0.0)' }}
            animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
            exit={{ opacity: 0, backgroundColor: 'rgba(0,0,0,0.0)' }}
            id="modal-portal"
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl"
          />
          <div className="fixed inset-0 z-[51] flex items-center justify-center">
            <motion.div
              key="content"
              ref={childrenContainer}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative"
            >
              {imageLoaded && (
                <CloseButton
                  onClick={close}
                  className="!absolute right-2 top-2 !bg-neutral-100 hover:!bg-neutral-200"
                />
              )}

              {children({ onLoad: () => setImageLoaded(true) })}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
