/**
 * @jest-environment node
 */
jest.mock('@/server/auth', () => require('../../testing/mocks').authMockModule)
jest.mock('@/server/files/storage', () => require('../../testing/mocks').storageMockModule)
jest.mock('@/utils', () => require('../../testing/mocks').utilsMockModule)

import { savePdfs } from '@/server/files/pdfs'
import { mockRequireAdmin, mockSaveFileToStorage, resetAllMocks } from '../../testing/mocks'

beforeEach(resetAllMocks)

describe('savePdfs', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(savePdfs([{ url: 'temp/a.pdf', name: 'doc.pdf' }])).rejects.toThrow('Unauthorized')
  })

  it('rejects invalid input', async () => {
    await expect(savePdfs('not-array')).rejects.toThrow()
  })

  it('saves temp PDFs to permanent paths', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    const result = await savePdfs([{ url: 'temp/a.pdf', name: 'My Document' }])
    expect(mockSaveFileToStorage).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
    expect(result[0].url).toMatch(/^pdf\//)
    expect(result[0].name).toBe('My Document')
  })

  it('skips save for non-temp URLs', async () => {
    const result = await savePdfs([{ url: 'pdf/existing.pdf', name: 'Existing' }])
    expect(mockSaveFileToStorage).not.toHaveBeenCalled()
    expect(result[0].url).toBe('pdf/existing.pdf')
  })
})
