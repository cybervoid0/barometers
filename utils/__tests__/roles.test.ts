import { isAdminRole } from '../roles'

describe('isAdminRole', () => {
  it('accepts ADMIN and OWNER', () => {
    expect(isAdminRole('ADMIN')).toBe(true)
    expect(isAdminRole('OWNER')).toBe(true)
  })

  it('rejects USER and unknown/empty roles', () => {
    expect(isAdminRole('USER')).toBe(false)
    expect(isAdminRole('admin')).toBe(false) // case-sensitive on purpose
    expect(isAdminRole('')).toBe(false)
    expect(isAdminRole(null)).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
  })
})
