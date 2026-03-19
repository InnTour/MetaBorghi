import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword } from './passwords'

/**
 * RBAC — 4 livelli come da Blueprint v3
 *
 *  guest           → utente non autenticato (nessun record DB)
 *  registered      → ospite registrato (wishlist, prenotazioni, recensioni)
 *  operator        → operatore borgo/azienda (gestione contenuti assegnati)
 *  admin           → admin InnTour / comune (accesso completo)
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
    newUser: '/registrati',
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

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, parsed.data.email),
          })

          if (!user || !user.isActive) return null

          const valid = await verifyPassword(parsed.data.password, user.passwordHash)
          if (!valid) return null

          // Aggiorna ultimo accesso
          await db.update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id))

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            image: user.avatarUrl,
          }
        } catch {
          // DB non raggiungibile — fallback credenziali legacy
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
        }
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
        Object.assign(session.user, {
          role: token.role ?? 'guest',
          id: token.sub,
        })
      }
      return session
    },
  },
})
