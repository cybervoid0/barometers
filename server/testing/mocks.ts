// Pure mock objects — no jest.mock() calls here.
// Test files use jest.mock() with require() factories pointing to this file.

function modelMock() {
  return {
    create: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findFirst: jest.fn(),
    findFirstOrThrow: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    createManyAndReturn: jest.fn(),
  }
}

type ModelMock = ReturnType<typeof modelMock>

// ── Individual mock objects (for assertions in tests) ───────────────
export const mockPrisma: {
  barometer: ModelMock
  manufacturer: ModelMock
  document: ModelMock
  image: ModelMock
  user: ModelMock
  inaccuracyReport: ModelMock
  material: ModelMock
  subCategory: ModelMock
  $transaction: jest.Mock
} = {
  barometer: modelMock(),
  manufacturer: modelMock(),
  document: modelMock(),
  image: modelMock(),
  user: modelMock(),
  inaccuracyReport: modelMock(),
  material: modelMock(),
  subCategory: modelMock(),
  $transaction: jest.fn((fn: (tx: Record<string, ModelMock>) => unknown) =>
    fn({ image: mockPrisma.image, barometer: mockPrisma.barometer }),
  ),
}

export const mockRequireAdmin = jest.fn()
export const mockRequireAuth = jest.fn()
export const mockGetSession = jest.fn()

export const mockMinioClient = {
  removeObject: jest.fn(),
  copyObject: jest.fn(),
  presignedPutObject: jest.fn(),
  getObject: jest.fn(),
}

export const mockUpdateTag = jest.fn()
export const mockRevalidateTag = jest.fn()

export const mockHeadersMap = new Map<string, string>()
export const mockHeadersFn = jest.fn(async () => mockHeadersMap)

export const mockAfter = jest.fn()

export const mockDeleteFileFromStorage = jest.fn()
export const mockSaveFileToStorage = jest.fn()
export const mockCreatePresignedUrl = jest.fn()

export const mockSlug = jest.fn((s: string) => s.toLowerCase().replace(/\s+/g, '-'))
export const mockGetIconBuffer = jest.fn((icon: string | null | undefined) =>
  icon ? Buffer.from(icon) : null,
)

// ── Module shapes (used in jest.mock factories via require()) ───────
export const prismaMockModule = { prisma: mockPrisma }
export const authMockModule = {
  requireAdmin: mockRequireAdmin,
  requireAuth: mockRequireAuth,
  getSession: mockGetSession,
}
export const minioMockModule = { minioClient: mockMinioClient, minioBucket: 'test-bucket' }
export const cacheMockModule = { updateTag: mockUpdateTag, revalidateTag: mockRevalidateTag }
export const headersMockModule = { headers: mockHeadersFn }
export const serverMockModule = { after: mockAfter }
export const storageMockModule = {
  deleteFileFromStorage: mockDeleteFileFromStorage,
  saveFileToStorage: mockSaveFileToStorage,
  createPresignedUrl: mockCreatePresignedUrl,
}
export const utilsMockModule = {
  slug: mockSlug,
  getIconBuffer: mockGetIconBuffer,
  getBrandSlug: jest.fn((name: string) => name.toLowerCase()),
  getBrandFileSlug: jest.fn((name: string) => name.toLowerCase()),
}

// ── Reset helper ────────────────────────────────────────────────────
export function resetAllMocks() {
  jest.clearAllMocks()
  mockHeadersMap.clear()
  mockRequireAdmin.mockResolvedValue({ user: { role: 'ADMIN', name: 'Test Admin' } })
  mockRequireAuth.mockResolvedValue({ user: { role: 'USER', name: 'Test User' } })
}
