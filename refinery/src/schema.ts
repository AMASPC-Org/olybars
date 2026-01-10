export const schemaInstructions = `
OUTPUT JSON REQUIREMENTS:
Strict boolean flags for amenities.
Extract exact URLs if found.
Calculate Confidence Score.
Identify LOCAL MAKERS (Breweries/Cideries/Distilleries).

{
  "identity": {
    "name": "String",
    "type": "String",
    "established_year": "Number or null",
    "website_url": "String or null",
    "social_links": {
        "facebook": "String or null",
        "instagram": "String or null"
    }
  },
  "features": {
    "has_pool": "Boolean (Pool Tables)",
    "has_darts": "Boolean",
    "has_karaoke": "Boolean (Any night)",
    "has_trivia": "Boolean (Any night)",
    "has_open_mic": "Boolean (Any night)",
    "has_live_music": "Boolean",
    "has_dance_floor": "Boolean",
    "has_jukebox": "Boolean",
    "has_arcade_games": "Boolean",
    "has_food": "Boolean",
    "has_outdoor_seating": "Boolean",
    "has_wifi": "Boolean"
  },
  "weekly_schedule": [
    {
      "day": "String (Monday, Tuesday...)",
      "open_time": "String (HH:mm) or null",
      "close_time": "String (HH:mm) or null",
      "events": [
        {
          "name": "String",
          "type": "String",
          "start_time": "String (24h)",
          "frequency": "String",
          "recurrence_note": "String",
          "description": "String (optional)",
          "external_url": "String (e.g. storyoly.com)"
        }
      ]
    }
  ],
  "happy_hour": {
    "has_happy_hour": "Boolean",
    "schedule": "String (e.g. 'Mon-Fri 4-6pm')",
    "drinks_special": "String (e.g. '$1 off wells')",
    "food_special": "String (e.g. 'Half price apps')"
  },
  "inventory": {
    "local_makers_featured": ["String (e.g. 'Whitewood Cider', 'Headless Mumby')"],
    "signature_drinks": ["String"]
  },
  "menu_highlights": {
    "hero_item": "String",
    "breakfast_service_level": "String (Full, Limited, None)",
    "kitchen_status": "String"
  },
  "vibe": {
    "headline": "String",
    "insider_tip": "String",
    "audience_tags": ["String"]
  },
  "metadata": {
    "confidence_score": "Number (0.0 to 1.0)",
    "data_sources": ["String"],
    "verification_notes": "String"
  }
}
`;
