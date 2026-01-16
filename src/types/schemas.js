"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandDNASchema = void 0;
const zod_1 = require("zod");
// 1. The Palette Schema
const PaletteSchema = zod_1.z.object({
    primary: zod_1.z.string().describe("Dominant hex color code (e.g. #FF5733)"),
    secondary: zod_1.z.string().describe("Secondary hex color code"),
    accent: zod_1.z.string().describe("Accent hex color code for buttons/highlights"),
    background_preference: zod_1.z.enum(['dark', 'light', 'colorful']).describe("Best background style for this brand"),
});
// 2. The Style Guide Schema
const StyleGuideSchema = zod_1.z.object({
    aesthetic: zod_1.z.string().describe("3-word visual summary (e.g. 'Industrial Rustic Chic')"),
    lighting_mood: zod_1.z.string().describe("The lighting vibe (e.g. 'Neon-soaked', 'Candlelit', 'Natural')"),
    texture_keywords: zod_1.z.array(zod_1.z.string()).describe("List of 3-5 visible textures (e.g. 'brick', 'velvet', 'wood')"),
});
// 3. The Generation Rules Schema (Guardrails)
const GenerationRulesSchema = zod_1.z.object({
    negative_prompt: zod_1.z.string().describe("Comma-separated list of elements to AVOID (e.g. 'cartoon, 3d render, bright neon')"),
    logo_placement: zod_1.z.enum(['center', 'bottom_right', 'top_left', 'top_right']).describe("Optimal placement for logo overlay"),
    human_presence: zod_1.z.enum(['crowded', 'sparse', 'no_humans']).describe("How populated the venue should look"),
});
// 4. The Master BrandDNA Schema
exports.BrandDNASchema = zod_1.z.object({
    palette: PaletteSchema,
    style_guide: StyleGuideSchema,
    generation_rules: GenerationRulesSchema,
    extraction_source: zod_1.z.enum(['upload', 'scraped', 'inferred']).describe("Where did we get this style?"),
    confidence_score: zod_1.z.number().min(1).max(100).describe("Confidence score (1-100) of the analysis"),
    notes: zod_1.z.string().optional().describe("Explanation of why we chose this style"),
    last_updated: zod_1.z.string().optional().describe("ISO Date string of extraction"),
});
