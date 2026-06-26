import type { AccessRole } from '@prisma/client'

/**
 * Single source of truth for "is this role allowed into the admin area".
 *
 * Both ADMIN and OWNER are privileged. Previously this predicate was duplicated
 * in four places (middleware, the admin layout, requireAdmin, and the shop's
 * adminGuard) with two different definitions, which locked OWNER out of the
 * admin UI while still letting it call the underlying mutations. Keep all of
 * them routed through here so they can't drift again.
 *
 * Type-only import of AccessRole, so this stays safe to use in the edge
 * middleware (no Prisma runtime pulled in).
 */
export function isAdminRole(role: AccessRole | string | null | undefined): boolean {
  return role === 'ADMIN' || role === 'OWNER'
}
