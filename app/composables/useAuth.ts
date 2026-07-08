export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
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
      const res = await $fetch<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      user.value = res.user
      initialized.value = true
      return res.user
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'ورود ناموفق بود.'))
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const res = await $fetch<{ user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
      })
      user.value = res.user
      initialized.value = true
      return res.user
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

  return { user, isLoggedIn, initialized, fetchUser, ensureFetched, login, register, logout }
}
