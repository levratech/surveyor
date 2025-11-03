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
