'use client'

import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import { Table } from '@/components/elements'
import { Separator } from '@/components/ui'
import { analyticsCookies, functionalCookies, necessaryCookies } from '@/services/cookie-consent'
import type { CookieTable } from '@/types'

const versionDate = dayjs('09-06-2025').format('MMMM D, YYYY')
const paragraphStyles = 'mb-4 indent-8 text-left'
const sectionStyles = 'mb-10 mt-10'
const listStyles = 'mb-10'
const tableHeadingStyle = 'inline'
const tableDescriptionStyle = 'mt-3'

export default function CookiePolicy() {
  const { accessor } = createColumnHelper<CookieTable>()
  const columns = [
    accessor('name', {
      header: 'Name',
      meta: {
        width: '20%',
      },
    }),
    accessor('domain', {
      header: 'Service',
      meta: {
        width: '15%',
      },
    }),
    accessor('description', {
      header: 'Description',
      meta: {
        width: '50%',
      },
    }),
    accessor('expiration', {
      header: 'Expiration',
      meta: {
        width: '15%',
      },
    }),
  ]
  const necessaryCookiesTable = useReactTable({
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    data: necessaryCookies,
  })
  const analyticsCookiesTable = useReactTable({
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    data: analyticsCookies,
  })
  const functionalCookiesTable = useReactTable({
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    data: functionalCookies,
  })
  return (
    <article>
      <section className={sectionStyles}>
        <h2 className="mb-3">Cookie Policy</h2>
        <p className={paragraphStyles}>
          Version: <span className="ml-2">{versionDate}</span>
        </p>
      </section>

      <Separator />

      <section className={sectionStyles}>
        <h3 className="mb-8">Introduction</h3>
        <p className={paragraphStyles}>
          This Cookie Policy explains how The Art of Weather Instruments Foundation (AWIF) uses
          cookies and similar technologies on our website.
        </p>
        <p className={paragraphStyles}>
          We are a non-profit foundation registered in the Netherlands (Stichting Art of Weather
          Instruments).
        </p>
        <p className={paragraphStyles}>
          Cookies are small text files stored on your device when you visit a website. They help us
          ensure the website functions correctly, improve performance, and provide additional
          functionality such as secure donations.
        </p>
        <p className={paragraphStyles}>
          By continuing to use our website, you consent to the use of cookies as described in this
          Policy. You can manage or withdraw your consent at any time via your browser settings or
          our cookie consent tool.
        </p>
      </section>

      <Separator />

      <section className={sectionStyles}>
        <h3 className="mb-8">Categories of Cookies We Use</h3>
        <ol className="list-decimal list-inside marker:text-lg marker:font-medium marker:leading-tight marker:tracking-wide space-y-3">
          <li className={listStyles}>
            <h4 className={tableHeadingStyle}>Strictly necessary cookies</h4>
            <p className={tableDescriptionStyle}>
              These cookies are essential for the website to function properly. They cannot be
              disabled.
            </p>
            <Table table={necessaryCookiesTable} />
          </li>
          <li className={listStyles}>
            <h4 className={tableHeadingStyle}>Performance and Analytics cookies</h4>
            <p className={tableDescriptionStyle}>
              These cookies help us understand how visitors use the website, so we can improve its
              performance.
            </p>
            <Table table={analyticsCookiesTable} />
          </li>
          <li>
            <h4 className={tableHeadingStyle}>Functional cookies</h4>
            <p className={tableDescriptionStyle}>
              These cookies enable enhanced functionality and personalization, especially in
              connection with secure donations via PayPal.
            </p>
            <Table table={functionalCookiesTable} />
          </li>
        </ol>
      </section>
    </article>
  )
}
