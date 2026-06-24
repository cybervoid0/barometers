import { prisma } from '@/prisma/prismaClient'

export interface LinkGuestOrdersResult {
  /** Whether any guest customer was linked/merged into the user. */
  linked: boolean
  /** Total number of orders the user owns after linking. */
  orderCount: number
}

/**
 * Attach guest checkout history to a user account.
 *
 * When someone checks out without logging in, a `Customer` row is created with
 * `userId = null`. This links those guest customers (matched by email) to the
 * given user so their orders appear under "My Orders".
 *
 * Handles three shapes safely with respect to the `Customer.userId` unique
 * constraint:
 *  - user has no customer yet  → promote one guest customer (set its userId)
 *  - user already has a customer → move guest orders onto it
 *  - several guest customers     → merge them all into a single target, then
 *    delete the now-empty duplicates
 *
 * Idempotent: a no-op when there are no guest customers for the email.
 */
export async function linkGuestOrdersToUser(
  userId: string,
  email: string,
): Promise<LinkGuestOrdersResult> {
  if (!userId || !email) {
    return { linked: false, orderCount: 0 }
  }

  const guests = await prisma.customer.findMany({
    where: { email, userId: null },
    select: { id: true },
  })

  if (guests.length === 0) {
    return { linked: false, orderCount: 0 }
  }

  return prisma.$transaction(async tx => {
    const existing = await tx.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    const guestIds = guests.map(g => g.id)

    // The single customer that will own all of the user's orders.
    let targetId: string
    if (existing) {
      targetId = existing.id
    } else {
      // Promote the first guest customer to the account (only this row gets the
      // userId, so the unique constraint is never violated).
      targetId = guestIds[0]
      await tx.customer.update({ where: { id: targetId }, data: { userId } })
    }

    // Re-home orders from any other guest customers, then delete the empties.
    const otherGuestIds = guestIds.filter(id => id !== targetId)
    if (otherGuestIds.length > 0) {
      await tx.order.updateMany({
        where: { customerId: { in: otherGuestIds } },
        data: { customerId: targetId },
      })
      await tx.customer.deleteMany({ where: { id: { in: otherGuestIds } } })
    }

    const orderCount = await tx.order.count({ where: { customerId: targetId } })
    return { linked: true, orderCount }
  })
}
