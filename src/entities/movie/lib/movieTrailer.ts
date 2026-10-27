export function getMovieTrailerEmbedUrl(url?: string | null): string | null {
  if (!url) return null

  try {
    const parsed = new URL(url)
    if (!['https:', 'http:'].includes(parsed.protocol)) return null
    const host = parsed.hostname.toLowerCase()
    const parts = parsed.pathname.split('/').filter(Boolean)
    let videoId: string | null = null

    if (host === 'youtu.be') {
      videoId = parts[0]
    } else if (
      [
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtube-nocookie.com',
        'www.youtube-nocookie.com',
      ].includes(host)
    ) {
      if (parsed.pathname === '/watch') videoId = parsed.searchParams.get('v')
      else if (['embed', 'v', 'shorts'].includes(parts[0])) videoId = parts[1]
      else if (parts[0] === 'u') videoId = parts[2]
    }

    return videoId && /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube.com/embed/${videoId}`
      : null
  } catch {
    return null
  }
}
