/**
 * CLI entry point: build graph.json from YAML System of Record.
 *
 * Usage: npx tsx scripts/build-graph.ts
 */
import { writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { buildGraph } from '../src/pipeline/build-graph';

const __dirname = dirname(fileURLToPath(import.meta.url));
const YAML_DIR = resolve(__dirname, '../src/data/System_of_Record');
const OUTPUT_PATH = resolve(__dirname, '../src/data/graph.json');

console.log('Building graph from YAML files...\n');

const { graph, warnings, stats } = buildGraph(YAML_DIR);

// Write output
writeFileSync(OUTPUT_PATH, JSON.stringify(graph, null, 2), 'utf-8');
console.log(`Wrote ${OUTPUT_PATH}\n`);

// Log stats
console.log('=== Node Counts by Type ===');
for (const [type, count] of Object.entries(stats.nodeCountsByType)) {
  console.log(`  ${type}: ${count}`);
}
console.log(`  TOTAL canvas: ${stats.canvasNodeCount}`);
console.log(`  TOTAL off-canvas: ${stats.offCanvasCount}`);

console.log('\n=== Edge Counts ===');
console.log(`  Total: ${stats.edgeCount}`);
for (const [type, count] of Object.entries(stats.edgeCountsByType).sort(
  (a, b) => b[1] - a[1],
)) {
  console.log(`  ${type}: ${count}`);
}

console.log('\n=== Combo Membership ===');
console.log(`  Combos: ${stats.comboCount}`);
for (const [comboId, count] of Object.entries(stats.comboMembership)) {
  console.log(`  ${comboId}: ${count} members`);
}

if (warnings.length > 0) {
  console.log(`\n=== Warnings (${warnings.length}) ===`);
  for (const w of warnings) {
    console.log(`  [${w.sourceEntity}.${w.field}] ${w.message}`);
  }
}

console.log('\nDone.');
