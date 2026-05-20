const RAW_API_URL = import.meta.env.VITE_API_URL

const normalizePath = (path: string) => {
	const collapsed = path.replace(/\/{2,}/g, '/')
	return collapsed.replace(/\/$/, '')
}

export const getApiBaseUrl = () => {
	if (!RAW_API_URL || !RAW_API_URL.trim()) {
		throw new Error(
			'Missing VITE_API_URL. Set it in .env (e.g. http://localhost:5211/api).',
		)
	}

	let parsed: URL
	try {
		parsed = new URL(RAW_API_URL.trim())
	} catch {
		throw new Error(
			`Invalid VITE_API_URL: "${RAW_API_URL}". Expected http(s) URL.`,
		)
	}

	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw new Error(
			`Invalid VITE_API_URL protocol: "${parsed.protocol}". Use http or https.`,
		)
	}

	const normalizedPath = normalizePath(parsed.pathname || '')
	return `${parsed.origin}${normalizedPath}`
}
