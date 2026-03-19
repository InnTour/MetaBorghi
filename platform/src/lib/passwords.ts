import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

const SALT_LENGTH = 32
const KEY_LENGTH = 64

/**
 * Hash password con scrypt (Node.js nativo, nessuna dipendenza esterna).
 * Formato: salt_hex:hash_hex
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

/**
 * Verifica password contro hash scrypt.
 * Usa timingSafeEqual per prevenire timing attacks.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false

  const salt = Buffer.from(saltHex, 'hex')
  const storedHash = Buffer.from(hashHex, 'hex')
  const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer

  return timingSafeEqual(storedHash, hash)
}
