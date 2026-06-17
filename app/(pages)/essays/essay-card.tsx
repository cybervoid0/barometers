import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Download } from 'lucide-react'
import { Badge, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui'
import { fileStorage } from '@/constants'
import type { AllEssaysDTO } from '@/server/essays/queries'
import { EssayEdit } from './essay-edit'

dayjs.extend(utc)

export function EssayCard({ essay }: { essay: AllEssaysDTO[number] }) {
  const pdfHref = fileStorage + essay.pdfUrl
  return (
    <Card className="flex h-full flex-col gap-3">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="font-normal">
            {essay.topic}
          </Badge>
          <EssayEdit essay={essay} />
        </div>
        <CardTitle className="text-base leading-snug break-words hyphens-auto">
          {essay.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{essay.standfirst}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <time
          dateTime={dayjs.utc(essay.date).format('YYYY-MM-DD')}
          className="text-xs text-muted-foreground"
        >
          {dayjs.utc(essay.date).format('D MMMM YYYY')}
        </time>
        <a
          href={pdfHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium no-underline transition-colors hover:text-primary"
          aria-label={`Download "${essay.title}" as PDF`}
        >
          <Download size={16} />
          Download
        </a>
      </CardFooter>
    </Card>
  )
}
