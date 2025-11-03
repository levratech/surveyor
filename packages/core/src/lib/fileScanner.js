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
