/**
 * Copy YAML files from the source System_of_Record/ directory
 * into the project's src/data/System_of_Record/.
 *
 * Usage: npx tsx scripts/sync-yaml.ts
 */
import { cpSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const SOURCE_DIR = resolve(__dirname, '../../System_of_Record');
const DEST_DIR = resolve(__dirname, '../src/data/System_of_Record');

const files = readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.yaml'));
let copied = 0;

for (const file of files) {
  cpSync(join(SOURCE_DIR, file), join(DEST_DIR, file));
  copied++;
  console.log(`  Copied ${file}`);
}

console.log(`\nSynced ${copied} YAML files from System_of_Record/`);
