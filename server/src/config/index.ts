import { ConfigSchema, type Config } from './schema';
import { loadLocalEnv } from './localEnv';

/**
 * Validates and exports the server configuration.
 * Single source of truth for the OlyBars backend.
 */
function initializeConfig(): Config {
    // 1. Load local environment files if not in production
    loadLocalEnv();

    // 2. Validate process.env against schema
    try {
        const config = ConfigSchema.parse(process.env);
        console.log('✅ [CONFIG] Configuration validated successfully.');
        return config;
    } catch (error: any) {
        console.error('❌ [CONFIG] Invalid Configuration:');
        if (error.errors) {
            error.errors.forEach((err: any) => {
                console.error(`   - ${err.path.join('.')}: ${err.message}`);
            });
        } else {
            console.error(error.message);
        }
        process.exit(1); // Fail Fast
    }
}

export const config = initializeConfig();
export default config;
