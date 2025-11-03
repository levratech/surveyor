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
