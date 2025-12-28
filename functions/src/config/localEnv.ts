import path from 'path';
import fs from 'fs';
import { isProduction } from './schema';

/**
 * Loads local .env files anchored to the repository root.
 * HARD-BLOCKED in production to ensure deterministic Secret Manager/ADC runtime configuration.
 */
export function loadLocalEnv() {
    if (isProduction()) {
        return;
    }

    console.warn('⚠️ [CONFIG] Local .env loading via code is disabled to prevent production crashes.');
    console.warn('👉 Use `node -r dotenv/config` or pre-load environment variables in your scripts.');
}
