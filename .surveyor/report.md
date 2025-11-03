## Survey Summary
Root: /srv/surveyor
Included files: 27
Shadow dir: .surveyor
### File: packages/core/dist/commands/build.d.ts
```typescript
/**
 * Executes the build command for the Surveyor tool.
 * This command loads the configuration, scans the included files,
 * and generates the report files in the shadow directory.
 */
export declare function build(): Promise<void>;

```

### File: packages/core/dist/commands/build.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = build;
const config_1 = require("../lib/config");
const fileScanner_1 = require("../lib/fileScanner");
const reportWriter_1 = require("../lib/reportWriter");
/**
 * Executes the build command for the Surveyor tool.
 * This command loads the configuration, scans the included files,
 * and generates the report files in the shadow directory.
 */
async function build() {
    // Load configuration from .project/surveyorrc.json or use defaults
    const config = (0, config_1.loadConfig)();
    // Scan files based on include/exclude patterns
    const files = await (0, fileScanner_1.scanFiles)(config);
    // Write the report.md and report.meta.json
    await (0, reportWriter_1.writeReport)(config, files);
    console.log('Report generated in', config.shadowDir);
}

```

### File: packages/core/dist/index.d.ts
```typescript
export {};

```

### File: packages/core/dist/index.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./commands/build");
const command = process.argv[2];
if (command === 'build') {
    (0, build_1.build)().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
else {
    console.log('Usage: svy build');
    process.exit(1);
}

```

### File: packages/core/dist/lib/config.d.ts
```typescript
/**
 * Configuration interface for the Surveyor tool.
 */
export interface Config {
    shadowDir: string;
    include: string[];
    exclude: string[];
}
/**
 * Loads the configuration from .project/surveyorrc.json if it exists,
 * otherwise returns the default configuration.
 */
export declare function loadConfig(): Config;

```

### File: packages/core/dist/lib/config.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Default configuration values.
 */
const defaultConfig = {
    shadowDir: '.surveyor',
    include: ['src/**', 'apps/**', 'packages/**'],
    exclude: ['**/node_modules/**', '.git/**', 'dist/**']
};
/**
 * Loads the configuration from .project/surveyorrc.json if it exists,
 * otherwise returns the default configuration.
 */
function loadConfig() {
    const configPath = (0, path_1.join)(process.cwd(), '.project', 'surveyorrc.json');
    if ((0, fs_1.existsSync)(configPath)) {
        const content = (0, fs_1.readFileSync)(configPath, 'utf-8');
        const userConfig = JSON.parse(content);
        return { ...defaultConfig, ...userConfig };
    }
    return defaultConfig;
}

```

### File: packages/core/dist/lib/fileScanner.d.ts
```typescript
import { Config } from './config';
/**
 * Scans the repository for files matching the include patterns
 * and excluding the exclude patterns.
 * Returns a sorted array of relative file paths.
 */
export declare function scanFiles(config: Config): Promise<string[]>;

```

### File: packages/core/dist/lib/fileScanner.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanFiles = scanFiles;
const fast_glob_1 = require("fast-glob");
/**
 * Scans the repository for files matching the include patterns
 * and excluding the exclude patterns.
 * Returns a sorted array of relative file paths.
 */
async function scanFiles(config) {
    const patterns = config.include;
    const ignore = config.exclude;
    // Use fast-glob to find files, returning relative paths
    const files = await (0, fast_glob_1.glob)(patterns, {
        ignore,
        cwd: process.cwd(),
        absolute: false
    });
    // Sort for deterministic ordering
    return files.sort();
}

```

### File: packages/core/dist/lib/reportWriter.d.ts
```typescript
import { Config } from './config';
/**
 * Writes the report.md and report.meta.json files to the shadow directory.
 */
export declare function writeReport(config: Config, files: string[]): Promise<void>;

```

### File: packages/core/dist/lib/reportWriter.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeReport = writeReport;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
/**
 * Mapping of file extensions to language names for syntax highlighting.
 */
const languageMap = {
    '.ts': 'typescript',
    '.js': 'javascript',
    '.json': 'json',
    '.md': 'markdown',
    '.py': 'python',
    // Add more extensions as needed
};
/**
 * Determines the language for syntax highlighting based on file extension.
 */
function getLanguage(filePath) {
    const ext = (0, path_1.extname)(filePath);
    return languageMap[ext];
}
/**
 * Writes the report.md and report.meta.json files to the shadow directory.
 */
async function writeReport(config, files) {
    const shadowDir = (0, path_1.join)(process.cwd(), config.shadowDir);
    // Ensure the shadow directory exists
    await (0, promises_1.mkdir)(shadowDir, { recursive: true });
    const reportMdPath = (0, path_1.join)(shadowDir, 'report.md');
    const reportMetaPath = (0, path_1.join)(shadowDir, 'report.meta.json');
    // Generate and write the meta.json file
    const meta = {
        root: (0, path_1.resolve)(process.cwd()),
        shadowDir: config.shadowDir,
        generatedAt: new Date().toISOString(),
        files
    };
    await (0, promises_1.writeFile)(reportMetaPath, JSON.stringify(meta, null, 2));
    // Generate the content for report.md
    let content = `## Survey Summary
Root: ${(0, path_1.resolve)(process.cwd())}
Included files: ${files.length}
Shadow dir: ${config.shadowDir}
`;
    // Append each file's content
    for (const file of files) {
        const lang = getLanguage(file);
        const fileContent = (0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), file), 'utf-8');
        content += `### File: ${file}
\`\`\`${lang || ''}
${fileContent}
\`\`\`

`;
    }
    // Write the report.md file
    await (0, promises_1.writeFile)(reportMdPath, content);
}

```

### File: packages/core/package.json
```json
{
  "name": "@levratech/surveyor",
  "version": "0.1.0",
  "main": "dist/index.js",
  "bin": {
    "svy": "dist/index.js",
    "surveyor": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "fast-glob": "^3.3.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}

```

### File: packages/core/src/commands/build.d.ts
```typescript
/**
 * Executes the build command for the Surveyor tool.
 * This command loads the configuration, scans the included files,
 * and generates the report files in the shadow directory.
 */
export declare function build(): Promise<void>;

```

### File: packages/core/src/commands/build.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = build;
const config_1 = require("../lib/config");
const fileScanner_1 = require("../lib/fileScanner");
const reportWriter_1 = require("../lib/reportWriter");
/**
 * Executes the build command for the Surveyor tool.
 * This command loads the configuration, scans the included files,
 * and generates the report files in the shadow directory.
 */
async function build() {
    // Load configuration from .project/surveyorrc.json or use defaults
    const config = (0, config_1.loadConfig)();
    // Scan files based on include/exclude patterns
    const files = await (0, fileScanner_1.scanFiles)(config);
    // Write the report.md and report.meta.json
    await (0, reportWriter_1.writeReport)(config, files);
    console.log('Report generated in', config.shadowDir);
}

```

### File: packages/core/src/commands/build.ts
```typescript
import { loadConfig } from '../lib/config';
import { scanFiles } from '../lib/fileScanner';
import { writeReport } from '../lib/reportWriter';

/**
 * Executes the build command for the Surveyor tool.
 * This command loads the configuration, scans the included files,
 * and generates the report files in the shadow directory.
 */
export async function build() {
  // Load configuration from .project/surveyorrc.json or use defaults
  const config = loadConfig();
  // Scan files based on include/exclude patterns
  const files = await scanFiles(config);
  // Write the report.md and report.meta.json
  await writeReport(config, config.roots, files);
  console.log(`Report generated in ${config.shadowDir} with ${files.length} files`);
}

```

### File: packages/core/src/index.d.ts
```typescript
export {};

```

### File: packages/core/src/index.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./commands/build");
const command = process.argv[2];
if (command === 'build') {
    (0, build_1.build)().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
else {
    console.log('Usage: svy build');
    process.exit(1);
}

```

### File: packages/core/src/index.ts
```typescript
import { build } from './commands/build';

const command = process.argv[2];

if (command === 'build') {
  build().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.log('Usage: svy build');
  process.exit(1);
}

```

### File: packages/core/src/lib/config.d.ts
```typescript
/**
 * Configuration interface for the Surveyor tool.
 */
export interface Config {
    shadowDir: string;
    include: string[];
    exclude: string[];
}
/**
 * Loads the configuration from .project/surveyorrc.json if it exists,
 * otherwise returns the default configuration.
 */
export declare function loadConfig(): Config;

```

### File: packages/core/src/lib/config.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Default configuration values.
 */
const defaultConfig = {
    shadowDir: '.surveyor',
    include: ['src/**', 'apps/**', 'packages/**'],
    exclude: ['**/node_modules/**', '.git/**', 'dist/**']
};
/**
 * Loads the configuration from .project/surveyorrc.json if it exists,
 * otherwise returns the default configuration.
 */
function loadConfig() {
    const configPath = (0, path_1.join)(process.cwd(), '.project', 'surveyorrc.json');
    if ((0, fs_1.existsSync)(configPath)) {
        const content = (0, fs_1.readFileSync)(configPath, 'utf-8');
        const userConfig = JSON.parse(content);
        return { ...defaultConfig, ...userConfig };
    }
    return defaultConfig;
}

```

### File: packages/core/src/lib/config.ts
```typescript
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

```

### File: packages/core/src/lib/fileScanner.d.ts
```typescript
import { Config } from './config';
/**
 * Scans the repository for files matching the include patterns
 * and excluding the exclude patterns.
 * Returns a sorted array of relative file paths.
 */
export declare function scanFiles(config: Config): Promise<string[]>;

```

### File: packages/core/src/lib/fileScanner.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanFiles = scanFiles;
const fast_glob_1 = require("fast-glob");
/**
 * Scans the repository for files matching the include patterns
 * and excluding the exclude patterns.
 * Returns a sorted array of relative file paths.
 */
async function scanFiles(config) {
    const patterns = config.include;
    const ignore = config.exclude;
    // Use fast-glob to find files, returning relative paths
    const files = await (0, fast_glob_1.glob)(patterns, {
        ignore,
        cwd: process.cwd(),
        absolute: false
    });
    // Sort for deterministic ordering
    return files.sort();
}

```

### File: packages/core/src/lib/fileScanner.ts
```typescript
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

```

### File: packages/core/src/lib/reportWriter.d.ts
```typescript
import { Config } from './config';
/**
 * Writes the report.md and report.meta.json files to the shadow directory.
 */
export declare function writeReport(config: Config, files: string[]): Promise<void>;

```

### File: packages/core/src/lib/reportWriter.js
```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeReport = writeReport;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
/**
 * Mapping of file extensions to language names for syntax highlighting.
 */
const languageMap = {
    '.ts': 'typescript',
    '.js': 'javascript',
    '.json': 'json',
    '.md': 'markdown',
    '.py': 'python',
    // Add more extensions as needed
};
/**
 * Determines the language for syntax highlighting based on file extension.
 */
function getLanguage(filePath) {
    const ext = (0, path_1.extname)(filePath);
    return languageMap[ext];
}
/**
 * Writes the report.md and report.meta.json files to the shadow directory.
 */
async function writeReport(config, files) {
    const shadowDir = (0, path_1.join)(process.cwd(), config.shadowDir);
    // Ensure the shadow directory exists
    await (0, promises_1.mkdir)(shadowDir, { recursive: true });
    const reportMdPath = (0, path_1.join)(shadowDir, 'report.md');
    const reportMetaPath = (0, path_1.join)(shadowDir, 'report.meta.json');
    // Generate and write the meta.json file
    const meta = {
        root: (0, path_1.resolve)(process.cwd()),
        shadowDir: config.shadowDir,
        generatedAt: new Date().toISOString(),
        files
    };
    await (0, promises_1.writeFile)(reportMetaPath, JSON.stringify(meta, null, 2));
    // Generate the content for report.md
    let content = `## Survey Summary
Root: ${(0, path_1.resolve)(process.cwd())}
Included files: ${files.length}
Shadow dir: ${config.shadowDir}
`;
    // Append each file's content
    for (const file of files) {
        const lang = getLanguage(file);
        const fileContent = (0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), file), 'utf-8');
        content += `### File: ${file}
\`\`\`${lang || ''}
${fileContent}
\`\`\`

`;
    }
    // Write the report.md file
    await (0, promises_1.writeFile)(reportMdPath, content);
}

```

### File: packages/core/src/lib/reportWriter.ts
```typescript
import { writeFile, mkdir } from 'fs/promises';
import { join, extname, resolve } from 'path';
import { readFileSync } from 'fs';
import { Config } from './config';

/**
 * Mapping of file extensions to language names for syntax highlighting.
 */
const languageMap: Record<string, string> = {
  '.ts': 'typescript',
  '.js': 'javascript',
  '.json': 'json',
  '.md': 'markdown',
  '.py': 'python',
  // Add more extensions as needed
};

/**
 * Determines the language for syntax highlighting based on file extension.
 */
function getLanguage(filePath: string): string | undefined {
  const ext = extname(filePath);
  return languageMap[ext];
}

/**
 * Writes the report.md and report.meta.json files to the shadow directory.
 */
export async function writeReport(config: Config, roots: string[], files: string[]) {
  const shadowDir = join(process.cwd(), config.shadowDir);
  // Ensure the shadow directory exists
  await mkdir(shadowDir, { recursive: true });
  const reportMdPath = join(shadowDir, 'report.md');
  const reportMetaPath = join(shadowDir, 'report.meta.json');

  // Generate and write the meta.json file
  const meta = {
    root: resolve(process.cwd()),
    shadowDir: config.shadowDir,
    generatedAt: new Date().toISOString(),
    files
  };
  await writeFile(reportMetaPath, JSON.stringify(meta, null, 2));

  // Generate the content for report.md
  let content = `## Survey Summary
Root: ${resolve(process.cwd())}
Included files: ${files.length}
Roots: ${roots.join(', ')}
Shadow dir: ${config.shadowDir}
`;
  // Append each file's content
  for (const file of files) {
    const lang = getLanguage(file);
    const fileContent = readFileSync(join(process.cwd(), file), 'utf-8');
    content += `### File: ${file}
\`\`\`${lang || ''}
${fileContent}
\`\`\`

`;
  }
  // Write the report.md file
  await writeFile(reportMdPath, content);
}

```

### File: packages/core/tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}

```

