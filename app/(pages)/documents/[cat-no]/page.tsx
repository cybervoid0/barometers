import 'server-only'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  Calendar,
  FileText,
  Globe,
  Link as LinkIcon,
  MapPin,
  Tag,
  User,
  /* ZoomIn, */
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { Image /* , ImageLightbox  */ } from '@/components/elements'
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui'
import { Route } from '@/constants'
import { getDocumentByCatNo } from '@/server/documents/queries'
import type { DynamicOptions } from '@/types'

interface Props {
  params: Promise<{
    'cat-no': string
  }>
}

export const dynamic: DynamicOptions = 'force-dynamic'
dayjs.extend(utc)

export default async function Document({ params }: Props) {
  const { 'cat-no': catNo } = await params
  const doc = await getDocumentByCatNo(decodeURIComponent(catNo))
  if (!doc) notFound()

  return (
    <article className="mx-auto mt-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={Route.Home}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={Route.Documents}>Documents</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{doc.catalogueNumber}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <header className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  <FileText className="w-3 h-3 mr-1" />
                  <span>{doc.documentType}</span>
                </Badge>
                <h2 className="tracking-tight text-secondary">{doc.title}</h2>
                <p className="text-lg text-muted-foreground">Cat. No. {doc.catalogueNumber}</p>
              </div>
            </div>

            {doc.description && <p className="text-lg leading-relaxed">{doc.description}</p>}
          </header>

          {/* Images Carousel */}
          {doc.images && doc.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel className="w-full">
                  <CarouselContent>
                    {doc.images.map((image, _index) => {
                      console.log('🚀 ~ Document ~ image:', image)

                      return (
                        <CarouselItem key={image.id}>
                          <Image
                            width={500}
                            height={500}
                            src={image.url}
                            alt={image.name ?? 'Document'}
                          />
                          <p>{image.url}</p>
                          {/* <ImageLightbox src={image.url} name={image.name}>
                            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group">
                              <Image
                                src={image.url}
                                alt={image.name || `${doc.title} - Image ${index + 1}`}
                                fill
                                className="object-contain transition-transform group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                              />
                              <div className="absolute inset-0 bg-transparent group-hover:bg-muted/40 transition-colors flex items-center justify-center">
                                <ZoomIn className="w-8 h-8 text-foreground opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                              </div>
                            </div>
                          </ImageLightbox> */}
                          {image.name && (
                            <p className="text-sm text-muted-foreground mt-2 text-center">
                              {image.name}
                            </p>
                          )}
                        </CarouselItem>
                      )
                    })}
                  </CarouselContent>
                  {doc.images.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              </CardContent>
            </Card>
          )}

          {/* Annotations */}
          {doc.annotations && doc.annotations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Inscriptions & Annotations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {doc.annotations.map((annotation, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: items not gonna change order
                    <li key={index} className="flex items-start gap-2">
                      <Tag className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span>{annotation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Physical Description */}
          {doc.physicalDescription && (
            <Card>
              <CardHeader>
                <CardTitle>Physical Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">{doc.physicalDescription}</p>
              </CardContent>
            </Card>
          )}

          {/* Provenance */}
          {doc.provenance && (
            <Card>
              <CardHeader>
                <CardTitle>Provenance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">{doc.provenance}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doc.creator && <MiniCard name="Creator" value={doc.creator} Icon={User} />}

              {doc.subject && <MiniCard name="Subject" value={doc.subject} Icon={FileText} />}

              {(doc.date || doc.dateDescription) && (
                <MiniCard
                  name="Date"
                  value={
                    doc.dateDescription || (doc.date && dayjs.utc(doc.date).format('MMMM D, YYYY'))
                  }
                  Icon={Calendar}
                />
              )}

              {doc.placeOfOrigin && (
                <MiniCard name="Place of Origin" value={doc.placeOfOrigin} Icon={MapPin} />
              )}

              {doc.language && <MiniCard name="Language" value={doc.language} Icon={Globe} />}

              {doc.acquisitionDate && (
                <MiniCard
                  name="Acquired"
                  value={dayjs.utc(doc.acquisitionDate).format('MMMM D, YYYY')}
                  Icon={Archive}
                />
              )}

              {doc.condition && (
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="w-fit text-primary-foreground cursor-default"
                  >
                    {doc.condition.name}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Barometers */}
          {doc.relatedBarometers && doc.relatedBarometers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Barometers</CardTitle>
                <CardDescription>Barometers associated with this document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {doc.relatedBarometers.map(barometer => (
                  <div key={barometer.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{barometer.name}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/collection/items/${barometer.slug}`}>
                        <LinkIcon className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Back to Documents */}
          <Button variant="outline" className="w-full" asChild>
            <Link href={Route.Documents}>← Back to Documents</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

const MiniCard = ({
  name,
  value,
  Icon,
}: {
  name: ReactNode
  value: ReactNode
  Icon: LucideIcon
}) => (
  <div className="flex items-center gap-3">
    <Icon className="w-4 h-4 text-muted-foreground" />
    <div>
      <p className="text-sm font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  </div>
)
