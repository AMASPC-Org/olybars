---
trigger: always_on
---

# UX, Performance & Observability

This rule ensures high performance, cost-efficiency, and a personalized user experience.

## 1. Bundle Size & Performance
- **Lazy Loading**: Use React `lazy()` and `Suspense` for heavy components (Modals, Dashboards).
- **Dynamic Imports**: Use `import()` for large libraries (e.g., Lucide icon sets).
- **Optimization**: Optimize all images (>1MB forbidden) and prefer WebP for the `src/assets/` directory.

## 2. Google Maps Cost Governance
- **Field Masking**: Request only required fields (`place_id`, `name`, `formatted_address`, `geometry`). Avoid "Atmosphere" data (ratings, reviews) unless necessary.
- **Library Policy**: Load only necessary libraries (e.g., `places`).
- **Static vs. Dynamic**: Use Static Maps for previews; use Dynamic JS Maps for the main `/map` hub.

## 3. Contextual UX Logic
- **Device-Aware**: Mobile (touch targets 44px+, stack layouts) vs. Desktop (data density, hover states).
- **State-Aware**: Logged-out (Join CTAs) vs. Logged-in (personal history).
- **League-Aware**: Membership status impacts visible promotions and rank displays.

## 4. Google-Native Observability
- **Logs**: Use Cloud Run Logs (Cloud Logging) with request correlation IDs.
- **Exceptions**: Use Cloud Error Reporting for backend exceptions (Node/Express).
- **Frontend Errors**: Capture `window.onerror` and post to a backend logger (no PII).
- **Forbidden**: Do not introduce third-party observability vendors without approval.

## 5. Map Visual Standards
- **Radar Beacons**: Use gold (#fbbf24) for "Buzzing" venues and blue (#60a5fa) for "Lively" venues.
- **Cleanup**: Clear all animation intervals on component unmount.
