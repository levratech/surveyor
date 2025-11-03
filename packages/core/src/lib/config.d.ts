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
