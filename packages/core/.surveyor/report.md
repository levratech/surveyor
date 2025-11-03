## Survey Summary
Root: /srv/surveyor/packages/core
Included files: 15
Shadow dir: .surveyor
### File: src/commands/build.d.ts
```typescript
/**
 * Executes the build command for the Surveyor tool.
 * This command loads the configuration, scans the included files,
 * and generates the report files in the shadow directory.
 */
export declare function build(): Promise<void>;

```

### File: src/commands/build.js
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

### File: src/commands/build.ts
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
  await writeReport(config, files);
  console.log('Report generated in', config.shadowDir);
}

```

### File: src/index.d.ts
```typescript
export {};

```

### File: src/index.js
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

### File: src/index.ts
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

### File: src/lib/config.d.ts
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

### File: src/lib/config.js
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

### File: src/lib/config.ts
```typescript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Configuration interface for the Surveyor tool.
 */
export interface Config {
  shadowDir: string;
  include: string[];
  exclude: string[];
}

/**
 * Default configuration values.
 */
const defaultConfig: Config = {
  shadowDir: '.surveyor',
  include: ['src/**', 'apps/**', 'packages/**'],
  exclude: ['**/node_modules/**', '.git/**', 'dist/**']
};

/**
 * Loads the configuration from .project/surveyorrc.json if it exists,
 * otherwise returns the default configuration.
 */
export function loadConfig(): Config {
  const configPath = join(process.cwd(), '.project', 'surveyorrc.json');
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf-8');
    const userConfig = JSON.parse(content);
    return { ...defaultConfig, ...userConfig };
  }
  return defaultConfig;
}

```

### File: src/lib/fileScanner.d.ts
```typescript
import { Config } from './config';
/**
 * Scans the repository for files matching the include patterns
 * and excluding the exclude patterns.
 * Returns a sorted array of relative file paths.
 */
export declare function scanFiles(config: Config): Promise<string[]>;

```

### File: src/lib/fileScanner.js
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

### File: src/lib/fileScanner.ts
```typescript
import { glob } from 'fast-glob';
import { Config } from './config';

/**
 * Scans the repository for files matching the include patterns
 * and excluding the exclude patterns.
 * Returns a sorted array of relative file paths.
 */
export async function scanFiles(config: Config): Promise<string[]> {
  const patterns = config.include;
  const ignore = config.exclude;
  // Use fast-glob to find files, returning relative paths
  const files = await glob(patterns, {
    ignore,
    cwd: process.cwd(),
    absolute: false
  });
  // Sort for deterministic ordering
  return files.sort();
}

```

### File: src/lib/reportWriter.d.ts
```typescript
import { Config } from './config';
/**
 * Writes the report.md and report.meta.json files to the shadow directory.
 */
export declare function writeReport(config: Config, files: string[]): Promise<void>;

```

### File: src/lib/reportWriter.js
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

### File: src/lib/reportWriter.ts
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
export async function writeReport(config: Config, files: string[]) {
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

