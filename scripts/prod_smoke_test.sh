#!/bin/bash
# OlyBars Production Smoke Test
# Usage: ./scripts/prod_smoke_test.sh [INTERNAL_HEALTH_TOKEN]

BACKEND_URL="https://olybars-backend-26629455103.us-west1.run.app"
HEALTH_TOKEN=$1

echo "🍺 Starting OlyBars Smoke Test on: $BACKEND_URL"

# 1. Basic Health Check
echo -e "\n[1/4] Checking API Health..."
HEALTH_STATUS=$(curl -s "$BACKEND_URL/health" | jq -r .status)
if [ "$HEALTH_STATUS" == "popping" ]; then
  echo "✅ API is Popping"
else
  echo "❌ API Health Failed: $HEALTH_STATUS"
fi

# 2. CORS Check (Simulating Client)
echo -e "\n[2/4] Checking CORS Headers..."
CORS_CHECK=$(curl -I -s -H "Origin: https://olybars.com" "$BACKEND_URL/health" | grep -i "Access-Control-Allow-Origin")
if [[ $CORS_CHECK == *"https://olybars.com"* ]]; then
  echo "✅ CORS Headers Present"
else
  echo "❌ CORS Headers Missing or Invalid"
fi

# 3. Artie Vibe Check
echo -e "\n[3/4] Checking Artie Intelligence..."
if [ -n "$HEALTH_TOKEN" ]; then
  ARTIE_STATUS=$(curl -s -H "X-Internal-Token: $HEALTH_TOKEN" "$BACKEND_URL/api/v1/health/artie" | jq -r .artieBrain)
  if [ "$ARTIE_STATUS" == "connected" ]; then
    echo "✅ Artie Brain Connected"
  else
    echo "❌ Artie Disconnected or Error"
  fi
else
  echo "⚠️ Skipping Artie Check (No Token Provided as \$1)"
fi

# 4. Venue Data Schema
echo -e "\n[4/4] Verifying Venue Data Structure..."
VENUE_COUNT=$(curl -s "$BACKEND_URL/api/v1/venues" | jq '. | length')
if [ "$VENUE_COUNT" -gt 0 ]; then
  echo "✅ Venue Data Retrieved ($VENUE_COUNT venues found)"
else
  echo "⚠️ Warning: No venues found or API error"
fi

echo -e "\n🍺 Smoke Test Complete."
