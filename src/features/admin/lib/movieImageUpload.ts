export const movieImageAccept = 'image/jpeg,image/png,image/webp'
export const maxMovieImageBytes = 10 * 1024 * 1024

export function validateMovieImage(file: File): string | null {
  if (!movieImageAccept.split(',').includes(file.type)) {
    return 'Виберіть зображення JPEG, PNG або WebP.'
  }
  if (file.size === 0) return 'Файл порожній. Виберіть інше зображення.'
  if (file.size > maxMovieImageBytes)
    return 'Зображення має бути не більше 10 МіБ.'
  return null
}

export const formatImageBytes = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toLocaleString('uk-UA', { maximumFractionDigits: 2 })} МіБ`
