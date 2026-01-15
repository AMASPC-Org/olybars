"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLocalEnv = loadLocalEnv;
const schema_1 = require("./schema");
/**
 * Loads local .env files anchored to the repository root.
 * HARD-BLOCKED in production to ensure deterministic Secret Manager/ADC runtime configuration.
 */
function loadLocalEnv() {
    if ((0, schema_1.isProduction)()) {
        return;
    }
    console.warn('⚠️ [CONFIG] Local .env loading via code is disabled to prevent production crashes.');
    console.warn('👉 Use `node -r dotenv/config` or pre-load environment variables in your scripts.');
}
