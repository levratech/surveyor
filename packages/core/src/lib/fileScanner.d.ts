import { Config } from './config';
/**
 * Scans the repository for files matching the include patterns
 * and excluding the exclude patterns.
 * Returns a sorted array of relative file paths.
 */
export declare function scanFiles(config: Config): Promise<string[]>;
