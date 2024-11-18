import React from 'react'
import NextImage from 'next/image'
import { Container, Image, Text, Title } from '@mantine/core'
import { googleStorageImagesFolder } from '../constants'
import styles from './styles.module.scss'

export default function About() {
  return (
    <Container py="xl">
      <Title mb="md" order={3} component="h2">
        Greetings, my name is Leo.
      </Title>
      <Text className={styles.paragraph}>
        <Image
          priority
          w={{ base: '100%', xs: 'fit-content' }}
          h={{ base: '300px', sm: '400px' }}
          alt="Leo"
          width={116}
          height={125}
          sizes="(max-width: 768px) 100vw, 50vw"
          src={`${googleStorageImagesFolder}a98daba6-1f4e-4614-aecd-ab5cb189fcaf.png`}
          style={{
            float: 'left',
            objectFit: 'contain',
          }}
          component={NextImage}
        />
        I am a collector and restorer of antique barometers, a member of the Society for the History
        of Technology (SHOT), European Society for Environmental History (ESEH) and the
        International Meteorological Artifact Preservation Program (IMAPP). I have dedicated myself
        to assembling a unique collection of weather instruments that represent masterpieces of the
        industrial era, spanning from the late 18th to the mid 20th century. For the past five
        years, I have passionately curated a diverse collection of barometers and other weather
        instruments, driven by a deep fascination with the history of meteorology. This dedication
        has also inspired me to write <span className={styles.bookTitle}>Barometer Odyssey</span>, a
        book that explores the evolution of barometers over time.
      </Text>
      <Text className={styles.paragraph}>
        My collection features more than 100 rare and exceptional items, including mercury and
        aneroid barometers, as well as barographs, mainly from the Victorian era. Some of the most
        esteemed manufacturers in my collection include Negretti & Zambra, Short & Mason, Joseph
        Hicks, Peter Dollond, Thomas Mason, Gottlieb Lufft, Richard Frères, Jules Richard, Bourdon,
        Naudet (PNHB), O. Comitti and Son, Massiot & Cie, Maple & Co, to name a few.
      </Text>
      <Text className={styles.paragraph}>
        The range of barometers in my collection is vast and varied, comprising wheel barometers in
        banjo cases, Stick barometers, Double-fluid barometers, Marine mercury and aneroid
        barometers, Sympiesometers, Fitzroy barometers, Thunder glasses, Storm glasses, and even
        Pocket barometers, including military aviation models. My collection also includes wall,
        tabletop, and floor-standing barometers, as well as barographs, thermographs,
        thermohygrographs, hygrographs, and classic weather houses. Moreover, I possess original
        documents from historical manufacturers and period advertisements, further enriching the
        collection’s historical value.
      </Text>
      <Text className={styles.paragraph}>
        I am very excited to be able to share my collection online with enthusiasts around the
        world. Each barometer is accompanied by high-quality photographs and a detailed description,
        ensuring that the beauty and craftsmanship of these instruments are fully appreciated. I am
        always happy to answer any questions you may have about the barometers or their history.
      </Text>
    </Container>
  )
}
