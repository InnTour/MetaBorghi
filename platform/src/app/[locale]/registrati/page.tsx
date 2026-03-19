'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError(t('register.password_mismatch'))
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || t('register.error'))
        setLoading(false)
        return
      }

      // Auto-login dopo registrazione
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('register.error'))
      } else {
        router.push('/account')
        router.refresh()
      }
    } catch {
      setError(t('register.error'))
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('register.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              {t('fields.name')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-foreground focus:border-[#00D084] focus:outline-none focus:ring-2 focus:ring-[#00D084]/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {t('fields.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-foreground focus:border-[#00D084] focus:outline-none focus:ring-2 focus:ring-[#00D084]/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              {t('fields.password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-foreground focus:border-[#00D084] focus:outline-none focus:ring-2 focus:ring-[#00D084]/20"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              {t('fields.confirm_password')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-foreground focus:border-[#00D084] focus:outline-none focus:ring-2 focus:ring-[#00D084]/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#00D084] px-4 py-2.5 font-semibold text-white transition hover:bg-[#00b872] disabled:opacity-50"
          >
            {loading ? t('register.loading') : t('register.submit')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('register.has_account')}{' '}
          <Link href="/accedi" className="font-medium text-[#00D084] hover:underline">
            {t('register.login_link')}
          </Link>
        </p>
      </div>
    </main>
  )
}
