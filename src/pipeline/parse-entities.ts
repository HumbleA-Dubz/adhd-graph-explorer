import { readFileSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import type { Entity, CanvasEntityType, EntityType } from './types';

// ── Helpers ───────────────────────────────────────────────────

function readYaml(dir: string, filename: string): Record<string, unknown> {
  const raw = readFileSync(join(dir, filename), 'utf-8');
  return parseYaml(raw) as Record<string, unknown>;
}

function makeEntity(
  id: string,
  type: EntityType,
  label: string,
  yamlKey: string,
  data: Record<string, unknown>,
): Entity {
  return { id, type, label, yamlKey, data };
}

// ── Per-file parsers ──────────────────────────────────────────

function parseProblems(dir: string): Entity[] {
  const raw = readYaml(dir, 'problems.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    entities.push(
      makeEntity(v.id as string, 'problem', key, key, v),
    );
  }
  return entities;
}

function parseClusters(dir: string): Entity[] {
  const raw = readYaml(dir, 'clusters.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    entities.push(
      makeEntity(v.id as string, 'cluster', key, key, v),
    );
  }
  return entities;
}

function parseMechanisms(dir: string): Entity[] {
  const raw = readYaml(dir, 'mechanisms.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    entities.push(
      makeEntity(v.id as string, 'mechanism', key, key, v),
    );
  }
  return entities;
}

function parseEngagementModels(dir: string): Entity[] {
  const raw = readYaml(dir, 'engagement_models.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    entities.push(
      makeEntity(v.id as string, 'engagement_model', key, key, v),
    );
  }
  return entities;
}

function parseMetaChallenges(dir: string): Entity[] {
  const raw = readYaml(dir, 'meta_challenges.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    entities.push(
      makeEntity(v.id as string, 'meta_challenge', key, key, v),
    );
  }
  return entities;
}

function parseFoundations(dir: string): Entity[] {
  const raw = readYaml(dir, 'foundations.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    entities.push(
      makeEntity(v.id as string, 'foundation', key, key, v),
    );
  }
  return entities;
}

function parseTechnologies(dir: string): Entity[] {
  const raw = readYaml(dir, 'technologies.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    // Technologies use their top-level key as ID (TECH_01 etc.)
    const name = (v.name as string) ?? key;
    entities.push(makeEntity(key, 'technology', name, key, v));
  }
  return entities;
}

function parseClaims(dir: string): Entity[] {
  const raw = readYaml(dir, 'claims.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    // Claims use their top-level key as ID (C001 etc.)
    const statement = (v.statement as string) ?? '';
    // Label is a truncated statement for display
    const label = statement.length > 60
      ? statement.slice(0, 57).trim() + '...'
      : statement;
    entities.push(makeEntity(key, 'claim', label, key, v));
  }
  return entities;
}

function parseSources(dir: string): Entity[] {
  const raw = readYaml(dir, 'sources.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    // Sources use citation key as ID, name as label
    const name = (v.name as string) ?? key;
    entities.push(makeEntity(key, 'source', name, key, v));
  }
  return entities;
}

function parseImplications(dir: string): Entity[] {
  const raw = readYaml(dir, 'implications.yaml');
  const entities: Entity[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    const name = (v.name as string) ?? key;
    // Implications use their top-level key as ID (IMP01 etc.)
    entities.push(makeEntity(key, 'implication', name, key, v));
  }
  return entities;
}

// ── Public API ────────────────────────────────────────────────

export interface ParsedEntities {
  problems: Entity[];
  clusters: Entity[];
  mechanisms: Entity[];
  engagementModels: Entity[];
  metaChallenges: Entity[];
  foundations: Entity[];
  technologies: Entity[];
  claims: Entity[];
  sources: Entity[];
  implications: Entity[];
  all: Entity[];
}

const CANVAS_TYPES: Set<string> = new Set<CanvasEntityType>([
  'problem',
  'mechanism',
  'engagement_model',
  'meta_challenge',
  'foundation',
  'technology',
  'implication',
]);

/** Parse all YAML files in the System_of_Record directory. */
export function parseAllEntities(yamlDir: string): ParsedEntities {
  const problems = parseProblems(yamlDir);
  const clusters = parseClusters(yamlDir);
  const mechanisms = parseMechanisms(yamlDir);
  const engagementModels = parseEngagementModels(yamlDir);
  const metaChallenges = parseMetaChallenges(yamlDir);
  const foundations = parseFoundations(yamlDir);
  const technologies = parseTechnologies(yamlDir);
  const claims = parseClaims(yamlDir);
  const sources = parseSources(yamlDir);
  const implications = parseImplications(yamlDir);

  const all = [
    ...problems,
    ...clusters,
    ...mechanisms,
    ...engagementModels,
    ...metaChallenges,
    ...foundations,
    ...technologies,
    ...claims,
    ...sources,
    ...implications,
  ];

  return {
    problems,
    clusters,
    mechanisms,
    engagementModels,
    metaChallenges,
    foundations,
    technologies,
    claims,
    sources,
    implications,
    all,
  };
}

/** Filter entities to canvas-visible types only. */
export function isCanvasType(type: EntityType): type is CanvasEntityType {
  return CANVAS_TYPES.has(type);
}
