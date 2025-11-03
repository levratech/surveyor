import { glob } from 'fast-glob';
import { join, resolve } from 'path';
import { Config } from './config';

/**
 * Scans the repository for files matching the include patterns
 * and excluding the exclude patterns.
 * Returns a sorted array of relative file paths.
 */
export async function scanFiles(config: Config): Promise<string[]> {
  const patterns: string[] = [];
  for (const root of config.roots) {
    for (const inc of config.include) {
      patterns.push(join(root, inc));
    }
  }
  const ignore = config.exclude.map(p => resolve(p));
  const files = await glob(patterns, {
    ignore,
    cwd: process.cwd(),
    absolute: false
  });
  // Filter out .surveyor/** to ensure it's never included
  const filtered = files.filter(f => !f.startsWith('.surveyor/'));
  // Sort for deterministic ordering
  return filtered.sort();
}
