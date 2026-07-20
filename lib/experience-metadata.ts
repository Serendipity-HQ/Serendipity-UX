import type { Experience } from '@serendipity-hq/design'

const EXTERNAL_URL_PREFIX = '__external_url:'
const PRICE_UNKNOWN = '__price_unknown'

export function externalEventTags(url: string | null, priceKnown: boolean): string[] {
  return [
    ...(url ? [`${EXTERNAL_URL_PREFIX}${encodeURIComponent(url)}`] : []),
    ...(!priceKnown ? [PRICE_UNKNOWN] : []),
  ]
}

export function externalUrlFor(experience: Experience): string | null {
  const value = experience.tags.find((tag) => tag.startsWith(EXTERNAL_URL_PREFIX))
  if (!value) return null
  try {
    return decodeURIComponent(value.slice(EXTERNAL_URL_PREFIX.length))
  } catch {
    return null
  }
}

export function hasKnownPrice(experience: Experience): boolean {
  return !experience.tags.includes(PRICE_UNKNOWN)
}

export function publicExperienceTags(experience: Experience): string[] {
  return experience.tags.filter((tag) => !tag.startsWith('__'))
}
