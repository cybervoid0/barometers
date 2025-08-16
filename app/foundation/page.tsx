import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/utils'
import { Separator } from '@/components/ui'
import { FrontRoutes } from '@/constants'

const paragraphSx = 'mb-4 indent-8 text-left'
const sectionSx = 'mt-10'
const header3Sx = 'mb-5 mt-10'
const listSx = cn(
  'mb-1 ml-12 space-y-2 -indent-6', //layout
  "[&>li]:before:mr-2 [&>li]:before:content-['—']", // dash-bullets
  '[&>li]:after:content-[";"] [&>li]:last-of-type:after:content-["."]', // colons and full stop
)
const contactTxSx = 'text-sm text-muted-foreground'

export default function Foundation() {
  return (
    <>
      <section className={sectionSx}>
        <h3 className={header3Sx}>Mission</h3>
        <Image
          alt="Art of Weather Instruments Foundation"
          width={300}
          height={120}
          src="shared/logo-awif_square_back.png"
          className={cn(
            'xs:ml-3 mx-auto mb-10 sm:ml-4',
            'xs:float-right block object-contain',
            'border-border overflow-hidden rounded-md border shadow-md',
            'animate-in fade-in duration-4000',
          )}
        />
        <p className={paragraphSx}>
          The mission of the foundation is to preserve and expand the distinguished collection of
          historical meteorological instruments assembled with dedication and expertise by its
          founder, Leo Shirokov, in doing so fostering, promoting, and safeguarding the traditions
          of decorative, applied, and artisanal arts, with a particular emphasis on Europe's
          cultural and scientific heritage, and encouraging international collaboration and the
          exchange of knowledge.
        </p>
        <p className="mb-1">The foundation seeks to achieve its objectives through:</p>
        <ul className={listSx}>
          <li>
            conducting research, attribution, and provenance documentation for each item in the
            collection, and presenting it on a publicly accessible platform showcasing the
            foundation's collection at barometers.info
          </li>
          <li>organizing exhibitions, lectures, and presentations</li>
          <li>collaborating with museums, collectors, researchers, and cultural institutions</li>
          <li>restoring and conserving artifacts</li>
          <li>
            publishing and disseminating printed and digital materials, including the founder's
            authored works on the history of barometers and subsequent publications of the
            foundation
          </li>
        </ul>
        <p>
          Particular attention is given to the scholarly quality, public accessibility, and cultural
          relevance of the foundation's activities.
        </p>
      </section>
      <section className={sectionSx}>
        <h3 className={header3Sx}>Message from the Founder</h3>
        <p className={paragraphSx}>
          'My journey into the world of antique barometers and other meteorological artifacts began
          as a deeply personal quest — a way to connect with the beauty, ingenuity, and spirit of
          past centuries. What started as a personal passion has grown into a cultural mission. I
          founded <em>The Art of Weather Instruments Foundation</em> and developed it into a
          cultural project dedicated to preserving and expanding this unique heritage, making it
          accessible to collectors, researchers, designers, students, and the wider public.'
        </p>
        <p className={paragraphSx}>
          'This is not merely a private collection, but a living encyclopedia of the history of
          science and aesthetics. These instruments are more than scientific tools — they are
          tangible connections to the ingenuity, craftsmanship, and artistry of past centuries. By
          investing your attention, time, or resources, you help ensure that this legacy is
          documented, accessible, and alive, continuing to inspire future generations around the
          world.'
        </p>
        <p className={paragraphSx}>
          'It is not simply a “display” — it is a comprehensive platform that connects people with
          history through real, physical objects. In a world where the digital often displaces the
          tangible, my project offers access to things that can be seen, understood, and experienced
          as part of our material culture. It preserves the traditions of craftsmanship and design,
          and in doing so, works not only to safeguard the past but also to inspire the future — for
          artisans, artists, engineers, historians, and all who value the meeting of science and
          beauty.'
        </p>
        <p className="text-right italic">L. Shirokov</p>
        <Separator className="my-10" />
        <section className={sectionSx}>
          <h3 className={cn(header3Sx, 'mb-8')}>Founding Board</h3>
          <div className="mb-10 flex flex-col items-center justify-evenly gap-6 sm:flex-row sm:items-start">
            <div className="flex h-full w-[240px] flex-col items-center gap-4">
              <Image
                src="shared/leo-founder.png"
                width={240}
                height={300}
                className="rounded-sm shadow-lg"
                alt="Leo Shirokov"
              />
              <p className="grow text-center text-xs">Leonid Shirokov — Chair & Co-Founder</p>
            </div>
            <div className="flex h-full w-[240px] flex-col gap-4">
              <Image
                src="shared/alex-founder.png"
                width={240}
                height={300}
                className="rounded-sm shadow-lg"
                alt="Alex Shenshin"
              />
              <p className="grow text-center text-xs">
                Aleksandr Shenshin — Treasurer/Secretary & Co-Founder
              </p>
            </div>
          </div>
        </section>
        <section className={sectionSx}>
          <h3 className={header3Sx}>Policy Plan</h3>
          <Image
            alt="Culture code"
            width={100}
            height={120}
            src="shared/culture-code.png"
            className="border-border float-left my-3 mr-6 overflow-hidden rounded-md border object-contain shadow-md"
          />
          <p className={paragraphSx}>
            The Art of Weather Instruments Foundation is an independent, non-profit organization
            dedicated to the preservation, study, and promotion of historical meteorological
            instruments as part of Europe's cultural and scientific heritage.
          </p>
          <p className={paragraphSx}>
            The Foundation's mission is to provide access to a collection of exceptional artistic
            and historical value, comprising meteorological measuring instruments from various
            periods, along with associated documents, contextual data, and accumulated expertise.
            This access is intended for the general public, researchers, collectors, and museum
            institutions — both in physical and digital form.
          </p>
          <h4 className={header3Sx}>Strategy</h4>
          <p className="mb-1">The Foundation aims to:</p>
          <ul className={listSx}>
            <li>
              Ensure the safeguarding and long-term conservation of meteorological instruments and
              related documents as carriers of scientific, artisanal, and cultural history
            </li>
            <li>
              Research the provenance, dating, stylistic, and technical characteristics of the
              collection's objects, including attribution and provenance documentation
            </li>
            <li>
              Carry out professional cataloguing and systematic classification of the collection
              according to museum standards
            </li>
            <li>
              Provide digital access to the collection via the website{' '}
              <Link href={FrontRoutes.Home}>www.barometers.info</Link>, including imagery and
              descriptions
            </li>
            <li>
              Collaborate with museums, archives, private collectors, scientific institutions,
              restorers, and cultural heritage funds
            </li>
            <li>
              Foster public interest in meteorology as a visual, historical, and educational
              phenomenon
            </li>
            <li>
              Develop publications — catalogues, scholarly and popular science articles, books, and
              studies on the collection and its broader context
            </li>
            <li>
              Explore the possibility of establishing, in the future, an independent museum or
              permanent exhibition space dedicated to meteorological instruments, with the aim of
              engaging the public with the history of science, technology, and aesthetics in an
              accessible and inspiring manner
            </li>
          </ul>
          <h4 className={cn('mt-6', header3Sx)}>Activity plan</h4>
          <p className="mb-1">Over the next three years, the Foundation intends to:</p>
          <ul className={listSx}>
            <li>
              Further expand the collection with objects of high historical value, rarity, or
              uniqueness — including prototypes, signature works by renowned makers, and
              under-documented types of instruments
            </li>
            <li>
              Undertake restoration of instruments when necessary, in cooperation with qualified
              professionals and in accordance with ethical heritage preservation guidelines
            </li>
            <li>
              Develop and integrate a digital collection management database into the public website
            </li>
            <li>
              Compile provenance dossiers and connect objects with their makers, owners, and
              historical contexts
            </li>
            <li>
              Organize temporary and online exhibitions in cooperation with other institutions
            </li>
            <li>Prepare, edit, and publish knowledge-based materials on the collection</li>
            <li>
              Inventory historical literature and archives, embedding them into the broader
              knowledge framework of instrument production and distribution
            </li>
            <li>
              Invite external experts and authors to contribute to research and public engagement
            </li>
            <li>
              Participate in grant programs, strengthen international networks, and represent the
              Foundation at relevant scientific and cultural forums
            </li>
          </ul>
        </section>
        <section className="mt-16">
          <div className="flex flex-col gap-8 sm:flex-row">
            <div className="flex flex-col items-center justify-center gap-2">
              <img src="/favicon.svg" alt="Logo" className="h-[100px] w-[100px]" />
              <p className="text-muted-foreground text-4xl font-medium tracking-wide uppercase">
                awif
              </p>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-1">
              <p className={contactTxSx}>Reg. name</p>
              <p className={contactTxSx}>Stichting Art of Weather Instruments</p>
              <p className={contactTxSx}>Trade name</p>
              <p className={contactTxSx}>The Art of Weather Instruments Foundation</p>
              <p className={contactTxSx}>KVK</p>
              <p className={contactTxSx}>98055216</p>
              <p className={contactTxSx}>RSIN</p>
              <p className={contactTxSx}>868340911</p>
              <p className={contactTxSx}>Reg. address</p>
              <p className={contactTxSx}>Jonker Florislaan 64 Nuenen 5673ML Netherlands </p>
              <p className={contactTxSx}>E-mail</p>
              <a className={contactTxSx} href="mailto:post@barometers.info">
                post@barometers.info
              </a>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}
