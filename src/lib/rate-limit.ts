const RATE_LIMIT_PREFIX = "kairos.rateLimit."

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined"
}

function getStorageKey(actionKey: string): string {
  return `${RATE_LIMIT_PREFIX}${actionKey}`
}

export function checkRateLimit(actionKey: string, cooldownMs: number): { allowed: boolean; retryAfterMs: number } {
  if (!isBrowserEnvironment()) {
    return { allowed: true, retryAfterMs: 0 }
  }

  try {
    const now = Date.now()
    const lastAttemptRaw = window.localStorage.getItem(getStorageKey(actionKey))
    const lastAttempt = Number(lastAttemptRaw ?? 0)

    if (Number.isFinite(lastAttempt) && now - lastAttempt < cooldownMs) {
      return { allowed: false, retryAfterMs: cooldownMs - (now - lastAttempt) }
    }

    window.localStorage.setItem(getStorageKey(actionKey), String(now))
    return { allowed: true, retryAfterMs: 0 }
  } catch {
    return { allowed: true, retryAfterMs: 0 }
  }
}
