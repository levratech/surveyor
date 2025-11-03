import { Config } from './config';
/**
 * Writes the report.md and report.meta.json files to the shadow directory.
 */
export declare function writeReport(config: Config, files: string[]): Promise<void>;
