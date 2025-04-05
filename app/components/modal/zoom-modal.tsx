'use client'

import { PropsWithChildren, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useClickOutside } from '@mantine/hooks'

interface ZoomModalProps extends PropsWithChildren {
  isOpened: boolean
  close: () => void
}

export function ZoomModal({ children, close, isOpened }: ZoomModalProps) {
  const childrenContainer = useClickOutside(close)

  useEffect(() => {
    document.body.style.overflow = isOpened ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpened])

  return createPortal(
    <AnimatePresence>
      {isOpened && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0, backgroundColor: 'transparent' }}
            animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
            exit={{ opacity: 0, backgroundColor: 'transparent' }}
            id="barometers-portal"
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl"
          />

          <div className="fixed inset-0 z-[51] flex items-center justify-center">
            <motion.div
              key="content"
              ref={childrenContainer}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
