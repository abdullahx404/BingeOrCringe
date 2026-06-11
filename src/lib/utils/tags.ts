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
  'Space Brainrot',
  'Time Travel Slop',
  'Alien Aura',
  'Dystopian Cooked',
  'Plot Holes in Orbit',
  'Multiverse Mid',
  'Jumpscare Only',
  'Trauma Fuel',
  'Nightmare Bait',
  'Demonic Rizz',
  'Cozy Horror',
  'Mid But Funny',
  'Cringe Comedy King',
  'Laugh or Cry',
  'Gen Z Humor Only',
  'Dad Joke Cinema',
  'Unhinged Comedy',
  'Oscar Bait',
  'Crying at 3AM',
  'Trauma Bond Movie',
  'Slow Burn Tears',
  'Family Trauma Core',
  'Based-Drama',
  'Character Development',
  'Tommy Shelby Aura',
  'Depressing',
  'Sci-Fi Horror Rizz',
  'Horror Comedy Gold',
  'Psychological Mindfuck',
  'Gore Maxxing',
  'Cannibal Core',
  'Wrong Turn Energy',
  'Anti-Hero',
  'Brutal AF',
  'Ultra Violence',
  'Bloodbath Cinema',
  'Violent AF',
  'Guts & Gore Only',
  'Brutality Peak',
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
