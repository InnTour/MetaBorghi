import { getTranslations } from 'next-intl/server'
import { requireRole, getAssignedBoroughs, getAssignedCompanies } from '@/lib/rbac'
import type { UserRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const t = await getTranslations('account')
  const { session, role } = await requireRole('registered')
  const user = session.user as { id: string; name: string; email: string; role: UserRole }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* Header profilo */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="mt-1 text-muted-foreground">{user.email}</p>
          <span className="mt-2 inline-block rounded-full bg-[#00D084]/10 px-3 py-1 text-sm font-medium text-[#00D084]">
            {t(`roles.${role}`)}
          </span>
        </div>
      </div>

      {/* Dashboard diversa per ruolo */}
      {role === 'registered' && <RegisteredDashboard userId={user.id} />}
      {role === 'operator' && <OperatorDashboard userId={user.id} />}
      {role === 'admin' && <AdminDashboard />}
    </main>
  )
}

// ── PROFILO UTENTE REGISTRATO ──────────────────────────────

async function RegisteredDashboard({ userId }: { userId: string }) {
  const t = await getTranslations('account')

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      <DashboardCard
        title={t('cards.wishlist')}
        description={t('cards.wishlist_desc')}
        href="/account/wishlist"
        icon="heart"
      />
      <DashboardCard
        title={t('cards.bookings')}
        description={t('cards.bookings_desc')}
        href="/account/prenotazioni"
        icon="calendar"
      />
      <DashboardCard
        title={t('cards.reviews')}
        description={t('cards.reviews_desc')}
        href="/account/recensioni"
        icon="star"
      />
      <DashboardCard
        title={t('cards.settings')}
        description={t('cards.settings_desc')}
        href="/account/impostazioni"
        icon="settings"
      />
    </div>
  )
}

// ── PROFILO OPERATORE ──────────────────────────────────────

async function OperatorDashboard({ userId }: { userId: string }) {
  const t = await getTranslations('account')
  const assignedBoroughs = await getAssignedBoroughs(userId)
  const assignedCompanies = await getAssignedCompanies(userId)

  return (
    <div className="mt-10 space-y-10">
      {/* Borghi assegnati */}
      {assignedBoroughs.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">{t('operator.assigned_borghi')}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {assignedBoroughs.map((a) => (
              <div key={a.id} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{a.borough?.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {a.canEditContent ? <PermBadge label={t('permissions.edit_content')} /> : null}
                  {a.canManageExperiences ? <PermBadge label={t('permissions.manage_experiences')} /> : null}
                  {a.canManageCompanies ? <PermBadge label={t('permissions.manage_companies')} /> : null}
                  {a.canViewAnalytics ? <PermBadge label={t('permissions.view_analytics')} /> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Aziende assegnate */}
      {assignedCompanies.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">{t('operator.assigned_companies')}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {assignedCompanies.map((a) => (
              <div key={a.id} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{a.company?.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {a.canEditProfile ? <PermBadge label={t('permissions.edit_profile')} /> : null}
                  {a.canManageProducts ? <PermBadge label={t('permissions.manage_products')} /> : null}
                  {a.canManageOrders ? <PermBadge label={t('permissions.manage_orders')} /> : null}
                  {a.canViewAnalytics ? <PermBadge label={t('permissions.view_analytics')} /> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Azioni rapide operatore */}
      <section>
        <h2 className="text-xl font-semibold">{t('operator.quick_actions')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <DashboardCard title={t('cards.bookings')} description={t('cards.bookings_desc')} href="/account/prenotazioni" icon="calendar" />
          <DashboardCard title={t('cards.analytics')} description={t('cards.analytics_desc')} href="/account/analytics" icon="chart" />
          <DashboardCard title={t('cards.settings')} description={t('cards.settings_desc')} href="/account/impostazioni" icon="settings" />
        </div>
      </section>
    </div>
  )
}

// ── PROFILO ADMIN ──────────────────────────────────────────

async function AdminDashboard() {
  const t = await getTranslations('account')

  return (
    <div className="mt-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title={t('admin.users')} description={t('admin.users_desc')} href="/admin/utenti" icon="users" />
        <DashboardCard title={t('admin.borghi')} description={t('admin.borghi_desc')} href="/admin/borghi" icon="map" />
        <DashboardCard title={t('admin.companies')} description={t('admin.companies_desc')} href="/admin/aziende" icon="building" />
        <DashboardCard title={t('admin.experiences')} description={t('admin.experiences_desc')} href="/admin/esperienze" icon="compass" />
        <DashboardCard title={t('admin.analytics')} description={t('admin.analytics_desc')} href="/admin/analytics" icon="chart" />
        <DashboardCard title={t('admin.system')} description={t('admin.system_desc')} href="/admin/sistema" icon="settings" />
      </div>
    </div>
  )
}

// ── COMPONENTI CONDIVISI ────────────────────────────────────

function DashboardCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <a
      href={href}
      className="group rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:border-[#00D084]/50"
    >
      <h3 className="font-semibold group-hover:text-[#00D084] transition-colors">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </a>
  )
}

function PermBadge({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-[#00B4D8]/10 px-2 py-0.5 text-[#00B4D8]">
      {label}
    </span>
  )
}
