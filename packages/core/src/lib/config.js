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
