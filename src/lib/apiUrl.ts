const normalizePath = (path: string) =>
  path.replace(/\/{2,}/g, '/').replace(/\/$/, '')

const resolveBaseUrl = (value: string, envName: string) => {
  if (!value) {
    throw new Error(
      `Missing ${envName}. Set it in .env before starting the frontend.`,
    )
  }

  if (value.startsWith('/')) {
    return normalizePath(value)
  }

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(
      `Invalid ${envName}: "${value}". Expected http(s) URL or relative path.`,
    )
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `Invalid ${envName} protocol: "${parsed.protocol}". Use http or https.`,
    )
  }

  return `${parsed.origin}${normalizePath(parsed.pathname || '')}`
}

export const getApiBaseUrl = () => {
  const rawApiUrl = import.meta.env.VITE_API_URL?.trim() || ''

  return resolveBaseUrl(rawApiUrl, 'VITE_API_URL')
}
