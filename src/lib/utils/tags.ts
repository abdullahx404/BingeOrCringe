export const TAGS = [
  'Binge But Cringe',
  'Emotional Damage',
  'Brainrot',
  'Delulu',
  'Aura Farm',
  'Negative Aura',
  'Underrated',
  'Overrated AF',
  'Peak Fiction',
  'SUS',
  'Solo Watch Only',
  'Low IQ',
  'Dramatic',
  'Dead-End',
] as const;

export type Tag = (typeof TAGS)[number];

export function isValidTag(value: string): value is Tag {
  return TAGS.includes(value as Tag);
}

export function isValidTagArray(values: string[]): values is Tag[] {
  return values.every(isValidTag);
}

/**
 * Returns only the valid tags from an array, filtering out any unknown values.
 */
export function sanitizeTags(values: string[]): Tag[] {
  return values.filter(isValidTag) as Tag[];
}
