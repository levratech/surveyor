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
