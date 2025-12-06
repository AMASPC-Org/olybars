# 07 – Frontend Architecture Guidelines

## 1. Tech Stack
* **Framework:** React (v18+)
* **Language:** TypeScript (Strict mode)
* **Build:** Vite
* **Styling:** Tailwind CSS
* **State:** React Query (Server) + Zustand (Client)

## 2. UX/UI: The "Bar-Ready" Standard
Bar environments are unique. [cite_start]Our UI must pass the **"Drunk Thumb" Test**[cite: 7]:
1.  **High Contrast:** Dark mode default. Text must be readable in dim lighting.
2.  **Big Targets:** Buttons must be 44px+ height. Fine motor skills may be impaired.
3.  **One-Handed:** Primary navigation (Nav Bar, FAB) must be reachable with a thumb.

## 3. Offline-First (PWA)
* Cell service in Oly bars (especially basements like The Brotherhood) is notorious.
* **Strategy:** App loads "stale" data from local storage immediately, then background refreshes.
* **Check-ins:** Queued locally if offline, synced when connection returns.

## 4. Integration with Artie
* **Floating Action Button (FAB):** Artie is always one tap away.
* **Streaming Responses:** AI responses stream in (typewriter effect) to reduce perceived latency.