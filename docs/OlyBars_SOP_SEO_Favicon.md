# OlyBars Knowledge Doc: SEO & Brand Assets (Global)

**Filename:** OlyBars_SOP_SEO_Favicon.md
**Version:** 1.0
**Date:** 2026-01-02
**Author:** OlyBars Brand/Compliance CMO

## 1. PURPOSE
To strictly define the global SEO metadata and browser favicon requirements for OlyBars.com. This ensures consistent branding, high click-through rates (CTR), and compliance with local search intent.

## 2. SOURCE OF TRUTH: METADATA
These tags must be present on the **Home Page** (index). Sub-pages should follow the syntax but adapt the Title/Description to their specific content.

### Page Title (<title>)
**Format:** Brand Name | Tagline | Location
**Value:** `OlyBars.com | The Nightlife OS for Downtown Olympia, WA`

### Meta Description (<meta name="description">)
**Value:** `Know before you go. View the real-time vibe map, find live happy hours, and join the Bar League. The ultimate pocket concierge for 98501 nightlife.`

## 3. SOURCE OF TRUTH: FAVICON / SITE ICON
The "Generic Globe" icon is prohibited. We use the "Clean Emblem" to ensure visibility at small scales (16px/32px).

* **Correct Asset:** `OlyBars.com Favicon Emblem Logo PNG Transparent (40x by 40px).png` (Gold horseshoe/tap on navy circle, NO text).
* **Incorrect Asset:** Any logo file containing the text "OLYBARS" below the emblem.
* **File Naming:** Rename the asset to `favicon.png` or `favicon.ico` for root directory upload.

## 4. IMPLEMENTATION SNIPPETS (HTML)

```html
<title>OlyBars.com | The Nightlife OS for Downtown Olympia, WA</title>

<meta name="description" content="Know before you go. View the real-time vibe map, find live happy hours, and join the Bar League. The ultimate pocket concierge for 98501 nightlife.">

<link rel="icon" type="image/png" href="/favicon.png">
```

## 5. COMPLIANCE & BRAND RULES (DO / DON'T)
* **DO** use "OlyBars.com" (CamelCase) in the title tag.
* **DO** include "98501" and "Olympia, WA" to trigger local SEO relevance.
* **DON'T** put drink prices (e.g., "$1 Beers") in the Meta Description; this risks violating LCB advertising rules if the promo changes or is non-compliant.
* **DON'T** use the logo with text for the favicon; it becomes unreadable at browser tab size.

## 6. VERIFICATION CHECKLIST
* [ ] Squint Test: Does the favicon look like a distinct gold horseshoe in the browser tab?
* [ ] Hover Test: Hover over the tab—does the full title "OlyBars.com | The Nightlife OS..." appear?
* [ ] Source Code: View Page Source -> Search for "description" -> Verify the text matches the Source of Truth above.
