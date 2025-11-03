import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Configuration interface for the Surveyor tool.
 */
export interface Config {
  shadowDir: string;
  roots: string[];
  include: string[];
  exclude: string[];
}

/**
 * Default configuration values (excluding roots which is auto-detected).
 */
const defaultConfig: Omit<Config, 'roots'> = {
  shadowDir: '.surveyor',
  include: ['**/*'],
  exclude: ['**/node_modules/**', 'dist/**', '**/*.d.ts', '**/*.map', '.git/**']
};

/**
 * Loads the configuration from .project/surveyorrc.json if it exists,
 * otherwise returns the default configuration with auto-detected roots.
 */
export function loadConfig(): Config {
  const configPath = join(process.cwd(), '.project', 'surveyorrc.json');
  let userConfig: Partial<Config> = {};
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf-8');
    userConfig = JSON.parse(content);
  }

  // Auto-detect roots if not specified in user config
  let roots: string[];
  if (userConfig.roots) {
    roots = userConfig.roots;
  } else {
    const cwd = process.cwd();
    if (existsSync(join(cwd, 'apps')) || existsSync(join(cwd, 'packages')) || existsSync(join(cwd, 'pnpm-workspace.yaml'))) {
      roots = ['apps/**', 'packages/**'];
    } else if (existsSync(join(cwd, 'src'))) {
      roots = ['src'];
    } else {
      roots = ['.'];
    }
  }

  // Merge exclude patterns and ensure .surveyor/** is always excluded
  const exclude = [...new Set([...defaultConfig.exclude, ...(userConfig.exclude || []), '.surveyor/**'])];

  return {
    ...defaultConfig,
    ...userConfig,
    roots,
    exclude
  };
}
