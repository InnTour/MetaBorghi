import { getTranslations } from 'next-intl/server'
import { requireRole } from '@/lib/rbac'
import { db } from '@/db'
import { users } from '@/db/schema'
import { asc } from 'drizzle-orm'
import type { UserRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const ROLE_COLORS: Record<UserRole, string> = {
  guest: 'bg-gray-100 text-gray-700',
  registered: 'bg-blue-100 text-blue-700',
  operator: 'bg-amber-100 text-amber-700',
  admin: 'bg-[#00D084]/10 text-[#00D084]',
}

export default async function AdminUsersPage() {
  const t = await getTranslations('admin_users')
  await requireRole('admin')

  let allUsers: (typeof users.$inferSelect)[] = []
  try {
    allUsers = await db.select().from(users).orderBy(asc(users.name))
  } catch {
    // DB non raggiungibile
  }

  const stats = {
    total: allUsers.length,
    registered: allUsers.filter((u) => u.role === 'registered').length,
    operators: allUsers.filter((u) => u.role === 'operator').length,
    admins: allUsers.filter((u) => u.role === 'admin').length,
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <StatCard label={t('stats.total')} value={stats.total} />
        <StatCard label={t('stats.registered')} value={stats.registered} />
        <StatCard label={t('stats.operators')} value={stats.operators} />
        <StatCard label={t('stats.admins')} value={stats.admins} />
      </div>

      {/* Tabella utenti */}
      <div className="mt-10 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium text-muted-foreground">{t('table.name')}</th>
              <th className="pb-3 font-medium text-muted-foreground">{t('table.email')}</th>
              <th className="pb-3 font-medium text-muted-foreground">{t('table.role')}</th>
              <th className="pb-3 font-medium text-muted-foreground">{t('table.status')}</th>
              <th className="pb-3 font-medium text-muted-foreground">{t('table.registered')}</th>
              <th className="pb-3 font-medium text-muted-foreground">{t('table.last_login')}</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="py-3 font-medium">{user.name}</td>
                <td className="py-3 text-muted-foreground">{user.email}</td>
                <td className="py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role as UserRole]}`}>
                    {t(`roles.${user.role}`)}
                  </span>
                </td>
                <td className="py-3">
                  {user.isActive ? (
                    <span className="text-[#00D084]">{t('status.active')}</span>
                  ) : (
                    <span className="text-destructive">{t('status.disabled')}</span>
                  )}
                </td>
                <td className="py-3 text-muted-foreground">
                  {user.createdAt?.toLocaleDateString('it-IT')}
                </td>
                <td className="py-3 text-muted-foreground">
                  {user.lastLoginAt?.toLocaleDateString('it-IT') ?? '—'}
                </td>
              </tr>
            ))}
            {allUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  {t('empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}
