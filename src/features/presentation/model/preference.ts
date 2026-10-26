export type Presentation = 'classic' | 'new'

export const PRESENTATION_KEY = 'cinema-presentation-v1'

export function readPresentation(
  storage: Pick<Storage, 'getItem'>,
): Presentation {
  try {
    return storage.getItem(PRESENTATION_KEY) === 'new' ? 'new' : 'classic'
  } catch {
    return 'classic'
  }
}

export function persistPresentation(
  storage: Pick<Storage, 'setItem'>,
  value: Presentation,
) {
  try {
    storage.setItem(PRESENTATION_KEY, value)
  } catch {
    // The preference still works for this visit when storage is unavailable.
  }
}
