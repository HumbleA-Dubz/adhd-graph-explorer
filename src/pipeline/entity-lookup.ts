import type { Entity, PipelineWarning } from './types';
import {
  stripParentheticals,
  extractParenthetical,
  substringMatch,
  extractClusterLetters,
  clusterLetterToId,
} from '@/utils/string';

/**
 * Entity resolution engine.
 *
 * Indexes all parsed entities and resolves free-text references
 * using conventions tried in order:
 *   1. Exact ID match
 *   2. Exact YAML key match (case-insensitive)
 *   3. Hybrid: extract ID from parenthetical, try as exact ID
 *   4. Strip parentheticals + exact YAML key match
 *   5. Substring/word-level match (non-cluster entities preferred)
 *   6. Cluster letter mapping ("A" -> "CL_A")
 */
export class EntityLookup {
  private byId = new Map<string, Entity>();
  private byYamlKey = new Map<string, Entity>();
  private allEntities: Entity[] = [];
  /** Non-cluster entities for substring matching (preferred over clusters) */
  private nonClusterEntities: Entity[] = [];
  readonly warnings: PipelineWarning[] = [];

  /** Index all entities for resolution. */
  index(entities: Entity[]): void {
    for (const e of entities) {
      this.allEntities.push(e);
      this.byId.set(e.id, e);
      this.byYamlKey.set(e.yamlKey.toLowerCase(), e);
      if (e.type !== 'cluster') {
        this.nonClusterEntities.push(e);
      }
    }
  }

  /** Resolve a reference string to an entity ID. Returns undefined if unresolved. */
  resolve(
    ref: string,
    context: { sourceEntity: string; field: string },
  ): string | undefined {
    const trimmed = ref.trim();

    // 1. Exact ID match
    if (this.byId.has(trimmed)) {
      return trimmed;
    }

    // 2. Exact YAML key match (case-insensitive)
    const byKey = this.byYamlKey.get(trimmed.toLowerCase());
    if (byKey) {
      return byKey.id;
    }

    // 3. Hybrid: extract ID from parenthetical and try as exact ID match
    //    e.g., "Task Initiation Failure (FP01)" -> try "FP01"
    //    This runs BEFORE substring matching to avoid false matches on cluster entries
    const parenContent = extractParenthetical(trimmed);
    if (parenContent) {
      const byParenId = this.byId.get(parenContent);
      if (byParenId) {
        return byParenId.id;
      }
    }

    // 4. Strip parentheticals, then try exact YAML key match on stripped name
    const stripped = stripParentheticals(trimmed);
    if (stripped && stripped !== trimmed) {
      const byStrippedKey = this.byYamlKey.get(stripped.toLowerCase());
      if (byStrippedKey) {
        return byStrippedKey.id;
      }
    }

    // 5. Substring and word-level matching
    //    Prefer non-cluster entities to avoid matching cluster metadata entries
    const nameToSearch = stripped || trimmed;
    if (nameToSearch.length >= 3) {
      // 5a. Non-cluster YAML key contains search term
      for (const e of this.nonClusterEntities) {
        if (substringMatch(e.yamlKey, nameToSearch)) {
          return e.id;
        }
      }

      // 5b. Search term contains non-cluster YAML key or label
      for (const e of this.nonClusterEntities) {
        if (e.yamlKey.length >= 5 && substringMatch(nameToSearch, e.yamlKey)) {
          return e.id;
        }
      }

      // 5c. Word-level: all significant words from search appear in YAML key or label
      const searchWords = nameToSearch
        .toLowerCase()
        .split(/[\s\-—]+/)
        .filter((w) => w.length >= 3);
      if (searchWords.length >= 2) {
        // Try non-cluster first
        for (const e of this.nonClusterEntities) {
          const keyLower = e.yamlKey.toLowerCase();
          const labelLower = e.label.toLowerCase();
          if (
            searchWords.every((w) => keyLower.includes(w)) ||
            searchWords.every((w) => labelLower.includes(w))
          ) {
            return e.id;
          }
        }
      }

      // 5d. Fall back to cluster entities for substring/word matching
      const clusterEntities = this.allEntities.filter((e) => e.type === 'cluster');
      for (const e of clusterEntities) {
        if (substringMatch(e.yamlKey, nameToSearch)) {
          return e.id;
        }
      }
      if (searchWords.length >= 2) {
        for (const e of clusterEntities) {
          const keyLower = e.yamlKey.toLowerCase();
          if (searchWords.every((w) => keyLower.includes(w))) {
            return e.id;
          }
        }
      }
    }

    // 6. Cluster letter mapping: single letter or "A — Description"
    const clusterLetters = extractClusterLetters(trimmed);
    if (clusterLetters.length === 1) {
      const clusterId = clusterLetterToId(clusterLetters[0]!);
      if (this.byId.has(clusterId)) {
        return clusterId;
      }
    }
    if (/^[A-C]$/.test(trimmed)) {
      const clusterId = clusterLetterToId(trimmed);
      if (this.byId.has(clusterId)) {
        return clusterId;
      }
    }

    // Unresolved - log warning
    this.warnings.push({
      sourceEntity: context.sourceEntity,
      field: context.field,
      unresolvedValue: trimmed,
      message: `Could not resolve reference "${trimmed}" from ${context.sourceEntity}.${context.field}`,
    });

    return undefined;
  }

  /** Resolve multiple references, filtering out unresolved ones. */
  resolveAll(
    refs: string[],
    context: { sourceEntity: string; field: string },
  ): string[] {
    const resolved: string[] = [];
    for (const ref of refs) {
      const id = this.resolve(ref, context);
      if (id !== undefined) {
        resolved.push(id);
      }
    }
    return resolved;
  }

  /** Get an entity by ID. */
  get(id: string): Entity | undefined {
    return this.byId.get(id);
  }

  /** Check if an ID exists. */
  has(id: string): boolean {
    return this.byId.has(id);
  }
}
