/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)
jest.mock('@/server/auth', () => require('../../testing/mocks').authMockModule)
jest.mock('next/cache', () => require('../../testing/mocks').cacheMockModule)
jest.mock('next/server', () => require('../../testing/mocks').serverMockModule)
jest.mock('@/server/files/storage', () => require('../../testing/mocks').storageMockModule)
jest.mock('@/utils', () => require('../../testing/mocks').utilsMockModule)

import { createEssay, deleteEssay, updateEssay } from '@/server/essays/actions'
import {
  mockAfter,
  mockDeleteFileFromStorage,
  mockPrisma,
  mockRequireAdmin,
  mockSaveFileToStorage,
  mockUpdateTag,
  resetAllMocks,
} from '../../testing/mocks'

beforeEach(resetAllMocks)

const validCreateData = {
  title: 'The slow chemistry of patina',
  standfirst: 'Why brass goes brown, and what to do about it.',
  topic: 'Materials',
  date: new Date('2026-01-15'),
  pdfFiles: [{ url: 'temp/abc.pdf', name: 'patina.pdf' }],
}

describe('createEssay', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(createEssay(validCreateData)).rejects.toThrow('Unauthorized')
    expect(mockPrisma.essay.create).not.toHaveBeenCalled()
  })

  it('rejects invalid data (missing PDF)', async () => {
    await expect(createEssay({ ...validCreateData, pdfFiles: [] })).rejects.toThrow()
  })

  it('rejects an invalid topic', async () => {
    await expect(createEssay({ ...validCreateData, topic: 'Nonsense' })).rejects.toThrow()
  })

  it('persists the temp PDF and stores its permanent url + name', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    mockPrisma.essay.create.mockResolvedValue({ id: 'e-1', title: validCreateData.title })

    const result = await createEssay(validCreateData)

    expect(mockSaveFileToStorage).toHaveBeenCalledWith(
      'temp/abc.pdf',
      expect.stringMatching(/^pdf\//),
    )
    expect(mockPrisma.essay.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: validCreateData.title,
          topic: 'Materials',
          pdfUrl: expect.stringMatching(/^pdf\//),
          pdfName: 'patina.pdf',
        }),
      }),
    )
    expect(result).toEqual({ id: 'e-1', title: validCreateData.title })
    expect(mockUpdateTag).toHaveBeenCalledWith('essays')
  })
})

describe('updateEssay', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(updateEssay({ id: 'e-1', title: 'X' })).rejects.toThrow('Unauthorized')
  })

  it('updates partial data without touching the PDF', async () => {
    mockPrisma.essay.update.mockResolvedValue({ id: 'e-1', title: 'New title' })
    const result = await updateEssay({ id: 'e-1', title: 'New title' })
    expect(result).toEqual({ success: true, data: { id: 'e-1', title: 'New title' } })
    expect(mockPrisma.essay.findUniqueOrThrow).not.toHaveBeenCalled()
    expect(mockAfter).not.toHaveBeenCalled()
  })

  it('keeps an unchanged (already-permanent) PDF without deleting the old object', async () => {
    mockPrisma.essay.findUniqueOrThrow.mockResolvedValue({ pdfUrl: 'pdf/keep.pdf' })
    mockPrisma.essay.update.mockResolvedValue({ id: 'e-1', title: 'X' })

    await updateEssay({ id: 'e-1', pdfFiles: [{ url: 'pdf/keep.pdf', name: 'keep.pdf' }] })

    expect(mockSaveFileToStorage).not.toHaveBeenCalled()
    expect(mockAfter).not.toHaveBeenCalled()
  })

  it('replaces the PDF and schedules deletion of the orphaned object', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    mockDeleteFileFromStorage.mockResolvedValue(undefined)
    mockPrisma.essay.findUniqueOrThrow.mockResolvedValue({ pdfUrl: 'pdf/old.pdf' })
    mockPrisma.essay.update.mockResolvedValue({ id: 'e-1', title: 'X' })

    await updateEssay({ id: 'e-1', pdfFiles: [{ url: 'temp/new.pdf', name: 'new.pdf' }] })

    expect(mockSaveFileToStorage).toHaveBeenCalledWith(
      'temp/new.pdf',
      expect.stringMatching(/^pdf\//),
    )
    expect(mockAfter).toHaveBeenCalledTimes(1)
    // run the scheduled cleanup callback
    await mockAfter.mock.calls[0][0]()
    expect(mockDeleteFileFromStorage).toHaveBeenCalledWith({ url: 'pdf/old.pdf', name: '' })
  })

  it('does not persist a new PDF when the essay no longer exists', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.essay.findUniqueOrThrow.mockRejectedValue(new Error('No Essay found'))

    const result = await updateEssay({
      id: 'gone',
      pdfFiles: [{ url: 'temp/x.pdf', name: 'x.pdf' }],
    })

    expect(mockSaveFileToStorage).not.toHaveBeenCalled()
    expect(mockPrisma.essay.update).not.toHaveBeenCalled()
    expect(result).toEqual({ success: false, error: 'Failed to update essay. Please try again.' })
  })

  it('returns an ActionResult on error', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.essay.update.mockRejectedValue(new Error('DB error'))
    const result = await updateEssay({ id: 'e-1', title: 'X' })
    expect(result).toEqual({ success: false, error: 'Failed to update essay. Please try again.' })
  })
})

describe('deleteEssay', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(deleteEssay('e-1')).rejects.toThrow('Unauthorized')
  })

  it('rejects invalid id', async () => {
    await expect(deleteEssay(123)).rejects.toThrow()
  })

  it('deletes the row and schedules removal of its PDF', async () => {
    mockDeleteFileFromStorage.mockResolvedValue(undefined)
    mockPrisma.essay.delete.mockResolvedValue({ pdfUrl: 'pdf/gone.pdf' })
    const result = await deleteEssay('e-1')

    expect(result).toEqual({ success: true, data: { id: 'e-1' } })
    expect(mockUpdateTag).toHaveBeenCalledWith('essays')
    await mockAfter.mock.calls[0][0]()
    expect(mockDeleteFileFromStorage).toHaveBeenCalledWith({ url: 'pdf/gone.pdf', name: '' })
  })
})
