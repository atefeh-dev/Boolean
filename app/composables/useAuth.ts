export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  subscribed: boolean
}

interface MeResponse {
  user: AuthUser | null
}

function extractErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    const anyErr = err as { data?: { statusMessage?: string }; statusMessage?: string }
    return anyErr.data?.statusMessage || anyErr.statusMessage || fallback
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
      throw new Error(extractErrorMessage(err, 'ورود ناموفق بود.'))
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
      })
      await fetchUser()
      return user.value
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
