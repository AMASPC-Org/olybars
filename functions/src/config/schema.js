"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLocal = exports.isProduction = exports.ConfigSchema = void 0;
const zod_1 = require("zod");
exports.ConfigSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('3001'),
    // Auth & Project
    GOOGLE_CLOUD_PROJECT: zod_1.z.string().default('ama-ecosystem-prod'),
    // Internal Communication (Secured via Secret Manager in Prod)
    INTERNAL_HEALTH_TOKEN: zod_1.z.string().min(1, 'INTERNAL_HEALTH_TOKEN is required for diagnostic endpoints'),
    // AI / Gemini (Private Secrets)
    GOOGLE_GENAI_API_KEY: zod_1.z.string().optional(), // Optional in prod (uses ADC)
    // Maps (Private Secrets - for server-side services)
    GOOGLE_BACKEND_KEY: zod_1.z.string().min(1, 'GOOGLE_BACKEND_KEY is required for server-side Maps services'),
    // Frontend Assets (Public - these MUST follow VITE_ naming convention)
    VITE_GOOGLE_BROWSER_KEY: zod_1.z.string().min(1, 'VITE_GOOGLE_BROWSER_KEY is required for frontend Maps display'),
    VITE_APP_CHECK_KEY: zod_1.z.string().optional(), // reCAPTCHA site key (public)
    // URLs
    FRONTEND_URL: zod_1.z.string().default('http://localhost:3000'),
});
const isProduction = () => process.env.NODE_ENV === 'production';
exports.isProduction = isProduction;
const isLocal = () => !process.env.K_SERVICE; // K_SERVICE is set in Cloud Run
exports.isLocal = isLocal;
