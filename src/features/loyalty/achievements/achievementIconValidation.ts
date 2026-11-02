const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

// Retro artwork contains only groups and paths. No CSS, URLs or references.
const SAFE_ATTRIBUTES: Readonly<Record<string, RegExp>> = {
  d: /^[MmZzLlHhVvCcSsQqTtAa0-9eE+.,\s-]+$/,
  fill: /^(?:#[0-9a-fA-F]{3,8}|none|currentColor)$/,
  stroke: /^(?:#[0-9a-fA-F]{3,8}|none|currentColor)$/,
  'fill-rule': /^(?:evenodd|nonzero)$/,
  'stroke-width': /^\d+(?:\.\d+)?$/,
  'stroke-linecap': /^(?:butt|round|square)$/,
  'stroke-linejoin': /^(?:miter|round|bevel)$/,
  class: /^(?:wm-shadow|wm-s|wm-a|wm-deco|wm-k|wm-shine)$/,
}

export function validateAchievementIconBody(body: string): string {
  // Fail closed outside browsers too; never return unvalidated markup.
  if (typeof DOMParser === 'undefined' || body.length > 250_000)
    throw new Error('Icon artwork cannot be validated')

  const document = new DOMParser().parseFromString(
    `<svg xmlns="${SVG_NAMESPACE}">${body}</svg>`,
    'image/svg+xml',
  )
  const root = document.documentElement
  if (
    root.localName !== 'svg' ||
    root.namespaceURI !== SVG_NAMESPACE ||
    document.getElementsByTagName('parsererror').length > 0
  )
    throw new Error('Invalid icon artwork')

  const elements = Array.from(root.getElementsByTagName('*'))
  if (!elements.some(element => element.localName === 'path'))
    throw new Error('Empty icon artwork')

  for (const element of [root, ...elements]) {
    if (element !== root) {
      if (
        element.namespaceURI !== SVG_NAMESPACE ||
        !['g', 'path'].includes(element.tagName)
      )
        throw new Error('Unsafe icon element')
      for (const attribute of Array.from(element.attributes)) {
        const pattern = Object.hasOwn(SAFE_ATTRIBUTES, attribute.name)
          ? SAFE_ATTRIBUTES[attribute.name]
          : undefined
        if (attribute.namespaceURI || !pattern?.test(attribute.value))
          throw new Error('Unsafe icon attribute')
      }
    }
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === 1) continue
      if (child.nodeType === 3 && !child.textContent?.trim()) continue
      throw new Error('Unsafe icon content')
    }
  }

  const serializer = new XMLSerializer()
  return Array.from(root.childNodes)
    .map(node => serializer.serializeToString(node))
    .join('')
}
