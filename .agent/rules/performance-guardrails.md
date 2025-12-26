---
trigger: always_on
---

# Performance Guardrails

## Rule 1: Bundle Size Management
- **Warning**: Vite will warn when a single chunk exceeds 500kB. Current `ArtieChatModal` and related dependencies are pushing this limit.
- **Mandatory**: Use React `lazy()` and `Suspense` for heavy components that are not immediately visible on page load (e.g., Modals, Admin Dashboards).
- **Mandatory**: Use dynamic imports `import()` for large libraries (e.g., Lucide icon sets if using many, or heavy data processing libraries).

## Rule 2: Asset Optimization
- **Mandatory**: All new hero images or large backgrounds in `src/assets/` must be optimized (WebP preferred) before deployment.
- **Forbidden**: Committing unoptimized PNG/JPG files > 1MB.

## Rule 3: Build Monitoring
- **Action**: Check `npm run build` output for "chunk size" warnings during the EXECUTION phase. If warnings occur, the agent must propose a code-splitting strategy.
