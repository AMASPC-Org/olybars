# OlyBars Glossary: Venue Types & Vibe Tags

## Core Philosophy
We separate **Operation** (Type) from **Atmosphere** (Tag).
* **Type:** Tells the user *how* they will be served.
* **Tag:** Tells the user *how* they will feel.

---

## 1. Primary Venue Types (Select Exactly One)
*The Operational Backbone. Determines the default Map Icon.*

### **Bar / Pub (Standard)**
* **Definition:** Alcohol is the primary revenue driver. Table service may be limited; bar service is primary.
* **The 3-Point Test:** 1) Must have a physical bar you can sit at. 2) Must serve alcohol. 3) Must not require a food order to enter.
* **Artie's Take:** *"The neighborhood living room. Come for a pint, stay for the conversation."*
* **Schema Value:** `bar_pub`

### **Restaurant & Bar**
* **Definition:** Food is the primary driver, BUT it passes the **3-Point Bar Test**.
* **Constraint:** If there is no physical bar to sit at, it is **NOT** an OlyBar. It is just a restaurant. We do not list "Table-Only" venues.
* **Artie's Take:** *"Come for the dinner, stay for the drink. Yes, you can sit at the rail."*
* **Schema Value:** `restaurant_bar`

### **Brewery / Taproom**
* **Definition:** Produces its own beer on-site OR focuses exclusively on a massive rotating tap list (Taphouse).
* **Operational Note:** Often counter-service rather than table-service.
* **Artie's Take:** *"Straight from the tank. If you ask for a Coors Light, they might politely ask you to leave."*
* **Schema Value:** `brewery_taproom`

### **Lounge / Club**
* **Definition:** Focused on nightlife, music, or upscale seating. Often late-night heavy. Lighting is low; volume is high.
* **Artie's Take:** *"Low lights, high spirits. Dress code might actually apply here."*
* **Schema Value:** `lounge_club`

### **Arcade Bar**
* **Definition:** Gaming is the primary draw (>50% floor space).
* **Artie's Take:** *"The playground. Bring quarters, or at least your A-game."*
* **Schema Value:** `arcade_bar`

---

## 2. Vibe Tags (Select All That Apply)
*The Searchable Atmosphere. These are the adjectives.*

### **Dive**
* **Definition:** Unpretentious, inexpensive, often cash-only or legacy.
* **Key Indicators:** Neon signs, sticker-covered fridges, heavy pours, "well-worn" furniture.
* **Artie's Take:** *"Sticky floors, warm hearts, and drinks that don't cost a mortgage payment."*
* **Schema Value:** `dive`

### **Speakeasy**
* **Definition:** Hidden entrance, prohibition aesthetic, or craft cocktail focus with a quiet atmosphere.
* **Key Indicators:** Hard to find door, no TVs, focus on mixology.
* **Artie's Take:** *"If you know, you know. Keep your voice down and your pinky up."*
* **Schema Value:** `speakeasy`

### **Sports Bar**
* **Definition:** The TV-to-Patron ratio is high. Game audio is often on.
* **Key Indicators:** Jerseys on the wall, multiple screens visible from every seat.
* **Artie's Take:** *"The only place where yelling at a screen is socially acceptable."*
* **Schema Value:** `sports`

### **Tiki / Theme**
* **Definition:** Immersive decor based on a specific theme (Tropical, Horror, etc.).
* **Key Indicators:** Elaborate glassware, specific music genres, escapist decor.
* **Artie's Take:** *"A vacation in a glass. Careful, those fruity drinks pack a punch."*
* **Schema Value:** `tiki_theme`

### **Wine Bar**
* **Definition:** Grape-focused. Educational or tasting-flight orientation.
* **Key Indicators:** Extensive bottle list, charcuterie focus.
* **Artie's Take:** *"Swirl, sniff, sip. The sophisticated choice."*
* **Schema Value:** `wine_focus`

### **Cocktail / Mixology**
* **Definition:** Spirit-forward. The bartender is a "Mixologist." Drinks take 5+ minutes to make.
* **Key Indicators:** Fresh herbs, house-made syrups, clear ice.
* **Artie's Take:** *"Art in a glass. Be patient, perfection takes time."*
* **Schema Value:** `cocktail_focus`

### **LGBTQ+ / Queer Bar**
* **Definition:** Specifically identified as a safe space and hub for the community.
* **Artie's Take:** *"Everyone is welcome, authenticity is required."*
* **Schema Value:** `lgbtq`

### **Patio / Beer Garden**
* **Definition:** Significant outdoor seating area.
* **Artie's Take:** *"Fresh air and cold beer. The perfect summer combo."*
* **Schema Value:** `patio_garden`
