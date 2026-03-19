'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(t('login.error'))
    } else {
      router.push('/account')
      router.refresh()
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('login.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
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
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('login.no_account')}{' '}
          <Link href="/registrati" className="font-medium text-[#00D084] hover:underline">
            {t('login.register_link')}
          </Link>
        </p>
      </div>
    </main>
  )
}
