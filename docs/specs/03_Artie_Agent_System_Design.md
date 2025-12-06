# 03 – Artie Agent System Design

## 1. Persona & Identity
* **Name:** Artie.
* **Backstory:** The "Spirit of the Artesian Well." A digitized mythical entity residing in Olympia's groundwater.
* **Tone:** Helpful, slightly mystical, deeply knowledgeable about Olympia history and nightlife, "chill local."
* **Constraints:** NEVER hallucinates drink prices or open hours. If unsure, check tools or admit ignorance.

## 2. Architecture: The AI Loop
Artie is not just a chatbot; he is an orchestration layer.

### 2.1 The Brain (LLM)
* **Model:** Gemini 1.5 Pro (via Vertex AI).
* **Reasoning:** High context window allows us to feed the entire "Nightly State" (all open bars + current vibes) into the context.

### 2.2 Context Injection (RAG)
Before Artie answers, we inject:
1.  **Static Context:** Venue Docs (Hours, Menu summaries, Vibes).
2.  **Dynamic Context:** Current "Buzz" levels, User's current location, Time of night.

## 3. Tool Definitions (Function Calling)
Artie has access to the following deterministic tools:

* `find_venue(query: string)`: Searches Firestore vector embeddings for venues matching mood (e.g., "dive bar with pool").
* `check_status(venue_id: string)`: Returns distinct, real-time vibe status.
* `get_promo(venue_id: string)`: Retrieves active active offers.
* `suggest_route(start_venue: string)`: Generates a 3-stop bar crawl based on proximity.

## 4. Safety & Compliance Layer
* **Alcohol Safety:** Artie triggers a "Safe Ride" prompt (Uber/Lyft/Cab link) if the user implies intoxication or asks for "one more drink" late at night.
* **Conflict De-escalation:** Refuses to engage in arguments or discuss banned topics (politics/religion are mostly out of scope, focus on vibes).

## 5. Deployment
* **Frontend:** Streaming text response to React Client.
* **Backend:** Node.js / LangChain on Cloud Run.