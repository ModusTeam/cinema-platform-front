const RAW_API_URL = import.meta.env.VITE_API_URL?.trim() || ''

const normalizePath = (path: string) => {
	return path.replace(/\/{2,}/g, '/').replace(/\/$/, '')
}

export const getApiBaseUrl = () => {
	if (!RAW_API_URL) {
		throw new Error(
			'Missing VITE_API_URL. Set it in .env (e.g. http://localhost:5211/api).',
		)
	}

	if (RAW_API_URL.startsWith('/')) {
		return normalizePath(RAW_API_URL)
	}

	let parsed: URL
	try {
		parsed = new URL(RAW_API_URL)
	} catch {
		throw new Error(
			`Invalid VITE_API_URL: "${RAW_API_URL}". Expected http(s) URL or relative path.`,
		)
	}

	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw new Error(
			`Invalid VITE_API_URL protocol: "${parsed.protocol}". Use http or https.`,
		)
	}

	return `${parsed.origin}${normalizePath(parsed.pathname || '')}`
}