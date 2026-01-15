"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const schema_1 = require("./schema");
const localEnv_1 = require("./localEnv");
/**
 * Validates and exports the server configuration.
 * Single source of truth for the OlyBars backend.
 */
function initializeConfig() {
    // 1. Load local environment files if not in production
    (0, localEnv_1.loadLocalEnv)();
    // 2. Validate process.env against schema
    try {
        const config = schema_1.ConfigSchema.parse(process.env);
        console.log('✅ [CONFIG] Configuration validated successfully.');
        return config;
    }
    catch (error) {
        console.error('❌ [CONFIG] Invalid Configuration:');
        if (error.errors) {
            error.errors.forEach((err) => {
                console.error(`   - ${err.path.join('.')}: ${err.message}`);
            });
        }
        else {
            console.error(error.message);
        }
        process.exit(1); // Fail Fast
    }
}
// Lazy Load Configuration to prevent crashes during Deployment/Discovery/Build
// when Runtime Environment Variables (Secret Manager) are not yet available.
let _config;
function getConfig() {
    if (!_config) {
        _config = initializeConfig();
    }
    return _config;
}
exports.config = new Proxy({}, {
    get: (_target, prop) => {
        return getConfig()[prop];
    }
});
exports.default = exports.config;
