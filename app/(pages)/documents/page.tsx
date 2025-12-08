import 'server-only'

import { Archive, FileText } from 'lucide-react'
import type { Metadata } from 'next'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { getAllDocuments } from '@/server/documents/queries'
import type { DynamicOptions } from '@/types'
import { DocumentTable } from './DocumentTable'

export const metadata: Metadata = {
  title: 'Document Archive',
  description: 'Browse our collection of historical documents and manuscripts',
}

export const dynamic: DynamicOptions = 'force-dynamic'

export default async function Documents() {
  const archive = await getAllDocuments()
  const totalDocuments = archive.length
  const documentTypes = [...new Set(archive.map(doc => doc.documentType))]

  return (
    <article className="mt-6">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <Archive className="w-8 h-8 text-secondary" />
          <div>
            <h2 className="text-secondary tracking-tight">Document Archive</h2>
            <p className="text-sm text-muted-foreground">
              Explore our collection of historical documents and manuscripts
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-muted-foreground">Items in collection</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Document Types</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentTypes.length}</div>
              <p className="text-xs text-muted-foreground">Different categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Document Types */}
        {documentTypes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Document Types</h3>
            <div className="flex flex-wrap gap-2">
              {documentTypes.map(type => (
                <Badge key={type} variant="secondary" className="text-xs text-primary-foreground">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Browse through {totalDocuments} documents in our archive. Click on any row to view
            detailed information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentTable archive={archive} />
        </CardContent>
      </Card>
    </article>
  )
}
