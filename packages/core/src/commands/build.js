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
