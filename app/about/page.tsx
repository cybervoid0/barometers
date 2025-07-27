import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShowMore } from '../components/showmore'
import { cn } from '@/lib/utils'

export const dynamic = 'force-static'
const paragraphStyles = 'mb-4 indent-8 text-left'
const bookTitleStyles = 'italic font-medium'
const headerStyles = 'mb-4 text-2xl font-bold'
const subheaderStyles = 'my-4 text-xl font-semibold'

export default function About() {
  return (
    <div className="container mx-auto mt-8 px-2 xl:px-0">
      <div className="rounded-lg bg-white p-6 shadow-lg md:p-12">
        <h2 className={headerStyles}>Greetings, my name is Leo.</h2>
        <p className={paragraphStyles}>
          <Image
            priority
            alt="Leo"
            width={79}
            height={125}
            sizes="(max-width: 768px) 100vw, 50vw"
            src="/shared/leo-shirokov.png"
            className="float-left h-[300px] w-full object-contain xs:w-fit sm:h-[400px]"
          />
          I am a collector and restorer of antique barometers, a member of the Society for the
          History of Technology (SHOT), European Society for Environmental History (ESEH) and the
          International Meteorological Artifact Preservation Program (IMAPP). I have dedicated
          myself to assembling a unique collection of weather instruments that represent
          masterpieces of the industrial era, spanning from the late 18th to the mid 20th century.
          For the past five years, I have passionately curated a diverse collection of barometers
          and other weather instruments, driven by a deep fascination with the history of
          meteorology. This dedication has also inspired me to write{' '}
          <span className={bookTitleStyles}>Barometer Odyssey*</span>, a book that explores the
          evolution of barometers over time.
        </p>
        <div className="mb-3 flex justify-center gap-2 py-3 xs:justify-start">
          <Button variant="outline" asChild>
            <a
              href="https://www.ozon.ru/product/barometr-odisseya-1918748239/?at=mqtkyRVAEhMBgPkoc8x4EGrHK39QKWiopqMgXhv53xWD&keywords=%D0%B1%D0%B0%D1%80%D0%BE%D0%BC%D0%B5%D1%82%D1%80+%D0%BE%D0%B4%D0%B8%D1%81%D1%81%D0%B5%D1%8F"
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy on Ozon
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://www.wildberries.ru/catalog/349322962/detail.aspx"
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy on Wildberries
            </a>
          </Button>
        </div>
        <p className={paragraphStyles}>
          My collection features more than 150 rare and exceptional items, including mercury and
          aneroid barometers, as well as barographs, mainly from the Victorian era. Some of the most
          esteemed manufacturers in my collection include Negretti & Zambra, Short & Mason, Joseph
          Hicks, Peter Dollond, Thomas Mason, Dominicus Sala, Breguet, J.C. Vickery, Gottlieb Lufft,
          Richard Frères, Jules Richard, Bourdon, Naudet (PNHB), Onorato Comitti, Massiot & Cie,
          Maple & Co, to name a few.
        </p>
        <p className={paragraphStyles}>
          The range of barometers in my collection is vast and varied, comprising wheel barometers
          in banjo cases, Stick barometers, Double-fluid barometers, Marine mercury and aneroid
          barometers, Sympiesometers, Fitzroy barometers, Thunder glasses, Storm glasses, and even
          Pocket barometers, including military aviation models. My collection also includes wall,
          tabletop, and floor-standing barometers, as well as barographs, thermographs,
          thermohygrographs, hygrographs, and classic weather houses. Moreover, I possess original
          documents from historical manufacturers and period advertisements, further enriching the
          collection’s historical value.
        </p>
        <p className={cn('pb-4', paragraphStyles)}>
          I am very excited to be able to share my collection online with enthusiasts around the
          world. Each barometer is accompanied by high-quality photographs and a detailed
          description, ensuring that the beauty and craftsmanship of these instruments are fully
          appreciated. I am always happy to answer any questions you may have about the barometers
          or their history.
        </p>
        <Separator className="my-4" />
        <div className="flex flex-col flex-nowrap items-center gap-4 pt-2 xs:flex-row">
          <p className={paragraphStyles}>
            <span className={bookTitleStyles}>*Barometer Odyssey</span> immerses the reader in the
            world of one of the most fascinating scientific instruments. This book explores
            centuries of experiments, discoveries, and inventions connected to the barometer, as
            well as its aesthetic and functional significance. From ancient studies of the vacuum to
            modern aneroid mechanisms, each chapter unveils the captivating story of the barometer.
            Featuring vivid examples from the author’s collection, this book will inspire you to
            discover the incredible world of weather forecasters. Currently available in Russian.
          </p>
          <Image
            alt="Book"
            width={160}
            height={160}
            sizes="(max-width: 576px) 70vw, 160px"
            src="/shared/about-circle.png"
            className="mb-4 w-[70%] xs:w-auto"
          />
        </div>
        <Separator className="my-4" />
        <h2 className={headerStyles}>Why Barometers?</h2>
        <p className={paragraphStyles}>
          A barometer is more than just an instrument for measuring atmospheric pressure. It is an
          artifact that unites science, art, and human ingenuity. It’s like a window into the past,
          filled with mysteries and captivating stories. Barometers played a pivotal role in the
          development of meteorology and navigation. Without them, 18th- and 19th-century ships
          could not foresee storms, and farmers couldn’t prepare for changes in the weather. These
          devices became symbols of humanity’s quest to understand nature. Today, each antique
          barometer represents a meeting with an era of great discoveries.
        </p>

        <ShowMore>
          <p className={paragraphStyles}>
            In our digital age, where devices blend into an indistinguishable uniformity, timeless
            barometers stand out as rare tools that are delightful to see and intriguing to interact
            with.
          </p>
          <p className={paragraphStyles}>
            I have been fortunate to find myself in a geographic crossroad where the historical
            paths of the barometer, stretching from its cradle in Great Britain to continental
            Europe, converge. Here, I can study these fascinating instruments crafted in Great
            Britain, France, the Netherlands, and Germany — countries that shaped the barometer not
            just as a scientific tool but as a part of everyday life. Through building and expanding
            my collection, I feel as though I’m traveling back in time, acquainting myself with the
            traditions of past artisans and their extraordinary sense of beauty.
          </p>
          <p className={paragraphStyles}>
            Barometers were handcrafted in workshops where craftsmanship was passed down from
            generation to generation. Before factories began mass-producing identical items,
            barometers were the fruit of collaboration among artisans of various specialties,
            combining their efforts into a refined and functional object.
          </p>
          <p className={paragraphStyles}>
            Each barometer holds its own story. Who made it? Who owned it? What eras did it witness?
            For example, one of my barometers, created during World War I, belonged to a young
            pilot. This brave man used the device to calculate altitude, taking his wooden plane
            into the sky to defend his country. The barometer survived combat and even the crash of
            the aircraft along with its owner, becoming a silent witness to the war. Now, as part of
            my collection, it tells its story, preserving the memory of those long gone.
          </p>
          <p className={paragraphStyles}>
            A barometer embodies both the sorrows of war and the romance of storms, adventures, and
            discoveries, while also evoking a sense of domestic warmth. It conjures images of ships
            and people trying to predict foul weather, farmers, and fishermen relying on it to make
            crucial decisions. These devices have witnessed many historic events. Barometers were
            aboard the Titanic — many of them crafted by the Belfast company Sharman D. Neill, Ltd.
            They were owned by kings and peasants alike, served in the Third Reich and Imperial
            Russia, and performed their duties in mountains, mines, ships, planes, and even
            stratospheric balloons.
          </p>
          <p className={paragraphStyles}>
            Today, antique barometers are works of art. Intricate carvings, inlays, exquisite dials,
            and meticulously crafted mechanisms blend functionality and aesthetics. Barometers tell
            stories of artisanal traditions that, unfortunately, are gradually fading into
            obscurity.
          </p>
          <p className={paragraphStyles}>
            When I hold an antique barometer, I see more than just an instrument for measuring
            pressure. It is a living testament to the skill, diligence, and aesthetic sensibilities
            of bygone eras. Each device is the result of efforts by numerous artisans, each
            contributing something unique. In every barometer, the personality of its maker is
            etched — their respect for tradition and their striving for perfection.
          </p>
          <h3 className={subheaderStyles}>Master Woodworkers</h3>
          <p className={paragraphStyles}>
            The foundation of any barometer is its case. Master woodworkers carefully selected the
            type of wood based on its texture, durability, and aesthetic appeal. Walnut, oak,
            mahogany, or rosewood — each material had its specific purpose. The wood was then
            manually processed: sanded, polished, and coated with varnish chosen to highlight the
            natural beauty of its grain.
          </p>
          <p className={paragraphStyles}>
            But choosing the wood was only part of the task. The combination of materials was
            crucial: inlays of ivory, mother-of-pearl, or metal added elegance to the case. Each
            case was unique, as the craftsman not only adhered to the standards of the time but also
            expressed their taste and vision of beauty.
          </p>
          <h3 className={subheaderStyles}>Wood Carvers</h3>
          <p className={paragraphStyles}>
            If the case was a canvas, the carving became the artisan’s signature. Carvers created
            intricate motifs: acanthus leaves, faces of winds, heraldic symbols, or floral patterns.
            Each design told a story through its symbolic meaning. The carvings also reflected the
            era and style, with Gothic elements, Baroque curves, or neoclassical simplicity
            indicating the tastes of the period and the preferences of the customer.
          </p>
          <h3 className={subheaderStyles}>Glassblowers</h3>
          <p className={paragraphStyles}>
            Without glassblowers, there would be no transparent dials or perfectly blown tubes for
            mercury barometers. Glass was made from molten sand and lead, requiring precise
            temperature control. Particularly challenging was the production of opal glass, which
            gave dials a soft, diffused glow. Glassblowers worked on mercury tubes for both
            barometers and thermometers, ensuring their perfect transparency and airtightness. These
            tubes were not just functional parts of the instrument but also aesthetic details,
            harmonizing with other materials.
          </p>
          <h3 className={subheaderStyles}>Engravers and Enamelers</h3>
          <p className={paragraphStyles}>
            The dial of a barometer is its face. Engravers manually applied scales and weather
            indicators using burins and stencils. Every letter and every number was the result of
            meticulous work. The fonts used for weather changes (&ldquo;Fair,&rdquo;
            &ldquo;Rain,&rdquo; &ldquo;Change&rdquo;) were chosen to be both aesthetically pleasing
            and legible.
          </p>
          <p className={paragraphStyles}>
            Enameled dials required the skills of enamelers, who applied layers of enamel to a metal
            base and fired them at high temperatures. Each layer was polished to a perfect sheen.
            This process created smooth, glossy surfaces that endured for decades.
          </p>
          <p className={paragraphStyles}>
            Porcelain dials were made by artisans from kaolin clay, then hand-painted with brushes
            or decals and fired again. Such work required not only technical expertise but also
            artistic sensibility.
          </p>
          <h3 className={subheaderStyles}>Mechanics and Clockmakers</h3>
          <p className={paragraphStyles}>
            The internal mechanism of an aneroid barometer is a world of its own, where levers,
            gears, chains, and springs interact. These components were crafted by clockmakers and
            precision mechanics.
          </p>
          <p className={paragraphStyles}>
            The aneroid capsule, the heart of the barometer, was made by metalworkers. Thin brass
            hemispheres were soldered together, and air was removed using a vacuum pump. This
            process demanded jewel-like precision, as even the slightest air leak would compromise
            the instrument&rsquo;s functionality.
          </p>
          <p className={paragraphStyles}>
            Brass was the primary metal for many parts of the barometer, from bezels to gears. These
            tasks were performed by brass workers who followed several stages of processing:
          </p>
          <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
            <li>
              Stamping and Cutting. Brass sheets were stamped or cut by hand to create the required
              shapes.
            </li>
            <li>
              Turning. Turners crafted parts such as bezels for dials, achieving perfect symmetry.
            </li>
            <li>
              Polishing. Brass components were meticulously polished to achieve a mirror finish and
              sometimes lacquered for protection against corrosion.
            </li>
            <li>
              Decoration. Engraving or inlay on bezels added decorative touches, particularly for
              higher-end models.
            </li>
          </ul>
          <p className={cn('mt-8', paragraphStyles)}>
            For budget barometers, paper or cardboard dials were used. This was the domain of
            printers:
          </p>
          <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
            <li>
              Paper and Cardboard Production. Paper was handmade from rags, while cardboard was
              created by pressing layers of paper together. The surface was carefully smoothed to
              make it suitable for printing scales.
            </li>
            <li>
              Scale Printing. Scales were printed typographically using wooden or metal fonts and
              presses.
            </li>
            <li>
              Varnishing. Finished dials were coated with a thin layer of varnish to protect them
              from moisture and dirt.
            </li>
          </ul>
          <p className={cn('mt-8', paragraphStyles)}>
            Each barometer is the labor of dozens of artisans who may never have met but worked
            together to create a masterpiece. Their skills, experience, and taste live on in every
            engraving stroke, every carving detail, and every finely blued needle. Every barometer
            is the synthesis of engineering genius and artistic vision.
          </p>
          <p className={paragraphStyles}>
            By preserving these barometers, I am safeguarding not just objects but the heritage of
            generations. This legacy reminds us that beauty and precision are born of respect for
            craftsmanship and tradition.
          </p>
        </ShowMore>
      </div>
    </div>
  )
}
