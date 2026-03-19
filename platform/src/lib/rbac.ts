import { redirect } from 'next/navigation'
import { auth, type UserRole } from './auth'
import { db } from '@/db'
import { userBoroughAssignments, userCompanyAssignments } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

// ── GERARCHIA RUOLI ─────────────────────────────────────────
// admin > operator > registered > guest

const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  registered: 1,
  operator: 2,
  admin: 3,
}

// ── PERMESSI PER RUOLO ──────────────────────────────────────

type Permission =
  | 'view:public'
  | 'wishlist:manage'
  | 'booking:create'
  | 'booking:view_own'
  | 'review:create'
  | 'profile:edit_own'
  | 'borough:edit_assigned'
  | 'experience:manage_assigned'
  | 'company:manage_assigned'
  | 'product:manage_assigned'
  | 'analytics:view_assigned'
  | 'user:manage_all'
  | 'borough:edit_all'
  | 'content:manage_all'
  | 'analytics:view_all'
  | 'system:configure'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: [
    'view:public',
  ],
  registered: [
    'view:public',
    'wishlist:manage',
    'booking:create',
    'booking:view_own',
    'review:create',
    'profile:edit_own',
  ],
  operator: [
    'view:public',
    'wishlist:manage',
    'booking:create',
    'booking:view_own',
    'review:create',
    'profile:edit_own',
    'borough:edit_assigned',
    'experience:manage_assigned',
    'company:manage_assigned',
    'product:manage_assigned',
    'analytics:view_assigned',
  ],
  admin: [
    'view:public',
    'wishlist:manage',
    'booking:create',
    'booking:view_own',
    'review:create',
    'profile:edit_own',
    'borough:edit_assigned',
    'experience:manage_assigned',
    'company:manage_assigned',
    'product:manage_assigned',
    'analytics:view_assigned',
    'user:manage_all',
    'borough:edit_all',
    'content:manage_all',
    'analytics:view_all',
    'system:configure',
  ],
}

// ── FUNZIONI HELPER ─────────────────────────────────────────

/**
 * Verifica se un ruolo ha un permesso specifico.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * Verifica se un ruolo è almeno al livello richiesto nella gerarchia.
 */
export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Ottiene la sessione corrente e verifica che il ruolo sia sufficiente.
 * Redirige a /accedi se non autenticato, a / se ruolo insufficiente.
 * Da usare nei Server Components.
 */
export async function requireRole(minimumRole: UserRole) {
  const session = await auth()

  if (!session?.user) {
    redirect('/accedi')
  }

  const userRole = (session.user as { role?: UserRole }).role ?? 'guest'

  if (!hasMinRole(userRole, minimumRole)) {
    redirect('/')
  }

  return { session, role: userRole }
}

/**
 * Verifica se un operatore è assegnato a un borgo specifico.
 */
export async function canManageBorough(userId: string, boroughId: string): Promise<boolean> {
  const session = await auth()
  const role = (session?.user as { role?: UserRole })?.role ?? 'guest'

  if (role === 'admin') return true
  if (role !== 'operator') return false

  try {
    const assignment = await db.query.userBoroughAssignments.findFirst({
      where: and(
        eq(userBoroughAssignments.userId, userId),
        eq(userBoroughAssignments.boroughId, boroughId),
      ),
    })
    return !!assignment
  } catch {
    return false
  }
}

/**
 * Verifica se un operatore è assegnato a un'azienda specifica.
 */
export async function canManageCompany(userId: string, companyId: string): Promise<boolean> {
  const session = await auth()
  const role = (session?.user as { role?: UserRole })?.role ?? 'guest'

  if (role === 'admin') return true
  if (role !== 'operator') return false

  try {
    const assignment = await db.query.userCompanyAssignments.findFirst({
      where: and(
        eq(userCompanyAssignments.userId, userId),
        eq(userCompanyAssignments.companyId, companyId),
      ),
    })
    return !!assignment
  } catch {
    return false
  }
}

/**
 * Ottiene tutti i borghi assegnati a un operatore.
 */
export async function getAssignedBoroughs(userId: string) {
  try {
    return await db.query.userBoroughAssignments.findMany({
      where: eq(userBoroughAssignments.userId, userId),
      with: { borough: true },
    })
  } catch {
    return []
  }
}

/**
 * Ottiene tutte le aziende assegnate a un operatore.
 */
export async function getAssignedCompanies(userId: string) {
  try {
    return await db.query.userCompanyAssignments.findMany({
      where: eq(userCompanyAssignments.userId, userId),
      with: { company: true },
    })
  } catch {
    return []
  }
}
