import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

/**
 * RBAC — 4 livelli come da Blueprint v3
 *
 *  guest           → utente non autenticato
 *  registered      → ospite registrato (wishlist, prenotazioni)
 *  operator        → operatore borgo (gestione esperienze, prodotti)
 *  admin           → admin comune / InnTour (accesso completo)
 */
export type UserRole = 'guest' | 'registered' | 'operator' | 'admin'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/accedi',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        // TODO: Fase 2 — verificare credenziali su DB (tabella users)
        // Per ora, accesso admin con credenziali legacy
        if (
          parsed.data.email === 'admin@metaborghi.org' &&
          parsed.data.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: 'admin-1',
            email: parsed.data.email,
            name: 'Admin MetaBorghi',
            role: 'admin' as UserRole,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any
        user.role = token.role ?? 'guest'
        user.id = token.sub
      }
      return session
    },
  },
})
