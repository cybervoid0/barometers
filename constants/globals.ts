export const foundation = {
  fullName: 'Stichting Art of Weather Instruments',
  tradeName: 'The Art of Weather Instruments Foundation',
  shortName: 'AWIF',
  postAddress: 'Jonker Florislaan 64, 5673ML Nuenen, The Netherlands',
  bitcoinAddress: 'bc1q6g0etsc0pu2s2zjk8t3rdej9624stxzq0hlm5f',
  ethereumAddress: '0x29B67cDAd027266Ed497b66a0c708e750d4436FA',
  regNo: '98055216',
}
// Social networks, contacts
export const email = 'post@barometers.info'
export const instagram = 'https://www.instagram.com/barometers_realm/'
export const twitterAccount = '@barometer_realm'

export const appURL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://barometers.info'

// External links
export const imageStorage = `${process.env.NEXT_PUBLIC_MINIO_URL}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}/`
export const github = 'https://github.com/cybervoid0/barometers'

export const BAROMETERS_PER_CATEGORY_PAGE = 12
export const DEFAULT_PAGE_SIZE = 12
