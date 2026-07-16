export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  subscribed: boolean
  emailVerified: boolean
}

interface MeResponse {
  user: AuthUser | null
}

function extractErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const anyErr = err as { data?: { message?: string }; message?: string }
    return anyErr.data?.message || anyErr.message || fallback
  }
  return fallback
}

/**
 * Real session-backed auth. The session itself lives in an httpOnly cookie
 * set by the server (see server/api/auth/*), so the client only ever holds
 * the public user shape — never a token or password.
 */
export function useAuth() {
  const user = useState<AuthUser | null>('auth_user', () => null)
  const initialized = useState<boolean>('auth_initialized', () => false)

  const isLoggedIn = computed(() => !!user.value)

  // On the server we need to forward the incoming request's cookies to
  // reach /api/auth/me; useRequestFetch does that for us automatically.
  const fetcher = import.meta.server ? useRequestFetch() : $fetch

  async function fetchUser() {
    try {
      const res = await fetcher<MeResponse>('/api/auth/me')
      user.value = res.user
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  async function ensureFetched() {
    if (!initialized.value) {
      await fetchUser()
    }
  }

  async function login(email: string, password: string) {
    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      // Don't trust the login response's echoed user object — refetch from
      // /me, the single canonical source for derived fields like
      // `subscribed`. Two endpoints independently computing the same
      // derived value is exactly what caused this to drift out of sync.
      await fetchUser()
      return user.value
    } catch (err) {
      // Preserve the status code on the re-thrown error (not just the
      // message) — login.vue needs to tell "wrong credentials" (401) apart
      // from "right credentials, email not verified yet" (403) to decide
      // whether to offer a resend-verification action, and matching
      // Persian message text for that would be fragile.
      const statusCode = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { statusCode?: number } }).data?.statusCode
        : undefined
      const wrapped = new Error(extractErrorMessage(err, 'ورود ناموفق بود.')) as Error & { statusCode?: number }
      wrapped.statusCode = statusCode
      throw wrapped
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
      })
      // No fetchUser() here, deliberately — registration no longer starts
      // a session (login is gated on email verification; see
      // register.post.ts / login.post.ts). The caller should route to a
      // "check your email" state, not treat this like a successful login.
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'ثبت‌نام ناموفق بود.'))
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
    }
  }

  // Called right after a successful newsletter subscribe so the nav/hero
  // reflect it immediately, without waiting on a full /me refetch.
  function markSubscribed() {
    if (user.value) user.value.subscribed = true
  }

  // Counterpart for a successful unsubscribe.
  function markUnsubscribed() {
    if (user.value) user.value.subscribed = false
  }

  return { user, isLoggedIn, initialized, fetchUser, ensureFetched, login, register, logout, markSubscribed, markUnsubscribed }
}
