/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)
jest.mock('@/server/auth', () => require('../../testing/mocks').authMockModule)
jest.mock('next/cache', () => require('../../testing/mocks').cacheMockModule)

import { createDocument, deleteDocument, updateDocument } from '@/server/documents/actions'
import { mockPrisma, mockRequireAdmin, mockRevalidateTag, resetAllMocks } from '../../testing/mocks'

beforeEach(resetAllMocks)

const validCreateData = {
  title: 'Test Document',
  catalogueNumber: 'DOC-001',
  documentType: 'Letter',
  subject: 'Weather',
  creator: 'John Doe',
  dateDescription: '19th century',
  placeOfOrigin: 'London',
  language: 'English',
  physicalDescription: 'Paper',
  annotations: ['note 1'],
  provenance: 'Private collection',
  description: 'A test document',
  conditionId: 'cond-1',
}

describe('createDocument', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(createDocument(validCreateData)).rejects.toThrow('Unauthorized')
    expect(mockPrisma.document.create).not.toHaveBeenCalled()
  })

  it('rejects invalid data', async () => {
    await expect(createDocument({ title: '' })).rejects.toThrow()
  })

  it('creates document and returns id + title', async () => {
    mockPrisma.document.create.mockResolvedValue({ id: 'd-1', title: 'Test Document' })
    const result = await createDocument(validCreateData)
    expect(result).toEqual({ id: 'd-1', title: 'Test Document' })
  })

  it('calls revalidateTag(Tag.documents, "max")', async () => {
    mockPrisma.document.create.mockResolvedValue({ id: 'd-1', title: 'Test' })
    await createDocument(validCreateData)
    expect(mockRevalidateTag).toHaveBeenCalledWith('documents', 'max')
  })
})

describe('updateDocument', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(updateDocument({ id: 'd-1', title: 'X' })).rejects.toThrow('Unauthorized')
  })

  it('updates document with partial data', async () => {
    mockPrisma.document.update.mockResolvedValue({ id: 'd-1', title: 'Updated Title' })
    const result = await updateDocument({ id: 'd-1', title: 'Updated Title' })
    expect(result).toEqual({ success: true, data: { id: 'd-1', title: 'Updated Title' } })
  })

  it('returns ActionResult on error', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.document.update.mockRejectedValue(new Error('DB error'))
    const result = await updateDocument({ id: 'd-1', title: 'X' })
    expect(result).toEqual({
      success: false,
      error: 'Failed to update document. Please try again.',
    })
  })
})

describe('deleteDocument', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(deleteDocument('d-1')).rejects.toThrow('Unauthorized')
  })

  it('rejects invalid id', async () => {
    await expect(deleteDocument(123)).rejects.toThrow()
  })

  it('deletes and returns ActionResult', async () => {
    mockPrisma.document.delete.mockResolvedValue({})
    const result = await deleteDocument('d-1')
    expect(result).toEqual({ success: true, data: { id: 'd-1' } })
    expect(mockRevalidateTag).toHaveBeenCalledWith('documents', 'max')
  })
})
