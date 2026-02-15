/**
 * Strip parenthetical annotations from a string.
 * "Time Blindness (primary)" → "Time Blindness"
 * "Task Initiation Failure (FP01)" → "Task Initiation Failure"
 */
export function stripParentheticals(s: string): string {
  return s.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

/**
 * Extract content inside parentheses.
 * "Task Initiation Failure (FP01)" → "FP01"
 * "Time Blindness (primary)" → "primary"
 */
export function extractParenthetical(s: string): string | null {
  const match = s.match(/\(([^)]+)\)/);
  return match ? match[1]!.trim() : null;
}

/**
 * Check if `haystack` contains `needle` as a substring (case-insensitive).
 */
export function substringMatch(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/**
 * Extract cluster letter(s) from a problem's `cluster` field.
 * "A — Time-Perception Cascade" → ["A"]
 * "A and C (convergence point)" → ["A", "C"]
 * "A and B (receives from both)" → ["A", "B"]
 * "Standalone" → []
 * "Cross-cluster amplifier" → []
 */
export function extractClusterLetters(clusterField: string): string[] {
  if (!clusterField || clusterField === 'Standalone' || clusterField.startsWith('Cross-cluster')) {
    return [];
  }

  // Match single uppercase letters that appear as cluster identifiers
  // Pattern: letter at start, or "and LETTER"
  const letters: string[] = [];
  const firstMatch = clusterField.match(/^([A-C])\b/);
  if (firstMatch) {
    letters.push(firstMatch[1]!);
  }

  // Look for "and X" pattern
  const andMatches = clusterField.matchAll(/\band\s+([A-C])\b/g);
  for (const m of andMatches) {
    letters.push(m[1]!);
  }

  return letters;
}

/**
 * Map a cluster letter to its entity ID.
 * "A" → "CL_A"
 */
export function clusterLetterToId(letter: string): string {
  return `CL_${letter.toUpperCase()}`;
}
