import { FC } from 'react'
import { Drawer, DrawerProps, Box, ActionIcon, Stack, Anchor } from '@mantine/core'
import * as motion from 'framer-motion/client'
import { SiMaildotru, SiInstagram } from 'react-icons/si'
import sx from './MobileMenu.module.scss'
import { instagram, email } from '@/app/constants'

export const MobileMenu: FC<DrawerProps> = props => {
  return (
    <Drawer.Root {...props}>
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header className={sx.header}>
          <Drawer.Title>Drawer title</Drawer.Title>
          <Drawer.CloseButton />
        </Drawer.Header>

        {/* Body */}
        <Drawer.Body p={0} className={sx.body}>
          <Stack h="100%" justify="space-between">
            {/* Menu */}
            <Box>Contents</Box>

            {/* Footer */}
            <Box
              component={motion.div}
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className={sx.footer}
            >
              <Anchor target="_blank" href={instagram}>
                <ActionIcon variant="default" className={sx.links}>
                  <SiInstagram size="100%" />
                </ActionIcon>
              </Anchor>
              <Anchor target="_blank" href={`mailto:${email}`}>
                <ActionIcon variant="default" className={sx.links}>
                  <SiMaildotru size="100%" />
                </ActionIcon>
              </Anchor>
            </Box>
          </Stack>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  )
}
