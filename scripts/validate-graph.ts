/**
 * CLI validation script: check graph.json for structural integrity.
 *
 * Usage: npx tsx scripts/validate-graph.ts
 */
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { GraphData } from '../src/pipeline/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_PATH = resolve(__dirname, '../src/data/graph.json');

console.log('Validating graph.json...\n');

const raw = readFileSync(INPUT_PATH, 'utf-8');
const graph = JSON.parse(raw) as GraphData;

let errors = 0;
let warnings = 0;

// Build set of all known node IDs (canvas + off-canvas)
const allNodeIds = new Set<string>();
for (const node of graph.canvasNodes) {
  allNodeIds.add(node.id);
}
for (const entity of graph.offCanvasEntities) {
  allNodeIds.add(entity.id);
}

// Build set of combo IDs
const comboIds = new Set<string>();
for (const combo of graph.combos) {
  comboIds.add(combo.id);
}

// Check 1: All edge source/target IDs exist in node list
console.log('=== Edge Reference Check ===');
const missingEdgeRefs = new Set<string>();
for (const edge of graph.edges) {
  if (!allNodeIds.has(edge.source) && !comboIds.has(edge.source)) {
    if (!missingEdgeRefs.has(`${edge.id}:source:${edge.source}`)) {
      console.log(`  ERROR: Edge ${edge.id} (${edge.edgeType}) references missing source: ${edge.source}`);
      missingEdgeRefs.add(`${edge.id}:source:${edge.source}`);
      errors++;
    }
  }
  if (!allNodeIds.has(edge.target) && !comboIds.has(edge.target)) {
    if (!missingEdgeRefs.has(`${edge.id}:target:${edge.target}`)) {
      console.log(`  ERROR: Edge ${edge.id} (${edge.edgeType}) references missing target: ${edge.target}`);
      missingEdgeRefs.add(`${edge.id}:target:${edge.target}`);
      errors++;
    }
  }
}
if (missingEdgeRefs.size === 0) {
  console.log('  OK: All edge references resolve.');
}

// Check 2: All comboId references on canvas nodes exist in combos list
console.log('\n=== Combo Reference Check ===');
let comboPassed = true;
for (const node of graph.canvasNodes) {
  if (node.comboId && !comboIds.has(node.comboId)) {
    console.log(`  ERROR: Node ${node.id} references missing combo: ${node.comboId}`);
    errors++;
    comboPassed = false;
  }
  if (node.secondaryClusters) {
    for (const sc of node.secondaryClusters) {
      if (!comboIds.has(sc)) {
        console.log(`  ERROR: Node ${node.id} secondary cluster references missing combo: ${sc}`);
        errors++;
        comboPassed = false;
      }
    }
  }
}
if (comboPassed) {
  console.log('  OK: All combo references resolve.');
}

// Check 3: No duplicate edge IDs
console.log('\n=== Duplicate Edge ID Check ===');
const edgeIdSet = new Set<string>();
let dupesPassed = true;
for (const edge of graph.edges) {
  if (edgeIdSet.has(edge.id)) {
    console.log(`  ERROR: Duplicate edge ID: ${edge.id}`);
    errors++;
    dupesPassed = false;
  }
  edgeIdSet.add(edge.id);
}
if (dupesPassed) {
  console.log('  OK: No duplicate edge IDs.');
}

// Check 4: Orphan nodes (zero edges) — warning only
console.log('\n=== Orphan Node Check ===');
const connectedNodes = new Set<string>();
for (const edge of graph.edges) {
  connectedNodes.add(edge.source);
  connectedNodes.add(edge.target);
}

const orphans: string[] = [];
for (const node of graph.canvasNodes) {
  if (!connectedNodes.has(node.id)) {
    orphans.push(`${node.id} (${node.type}: ${node.label})`);
    warnings++;
  }
}
for (const entity of graph.offCanvasEntities) {
  if (!connectedNodes.has(entity.id)) {
    orphans.push(`${entity.id} (${entity.type}: ${entity.label})`);
    warnings++;
  }
}

if (orphans.length > 0) {
  console.log(`  WARNING: ${orphans.length} orphan nodes (no edges):`);
  for (const o of orphans) {
    console.log(`    ${o}`);
  }
} else {
  console.log('  OK: No orphan nodes.');
}

// Summary
console.log('\n=== Summary ===');
console.log(`  Canvas nodes: ${graph.canvasNodes.length}`);
console.log(`  Off-canvas entities: ${graph.offCanvasEntities.length}`);
console.log(`  Edges: ${graph.edges.length}`);
console.log(`  Combos: ${graph.combos.length}`);
console.log(`  Errors: ${errors}`);
console.log(`  Warnings: ${warnings}`);

if (errors > 0) {
  console.log('\nVALIDATION FAILED.');
  process.exit(1);
} else {
  console.log('\nVALIDATION PASSED.');
}
