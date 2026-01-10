import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { schemaInstructions } from './schema.js';
import { REFINERY_CONSTITUTION } from './rules.js';
import { GooglePlacesService } from './services/GooglePlacesService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const placesService = new GooglePlacesService();

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  systemInstruction: REFINERY_CONSTITUTION,
  // @ts-ignore
  tools: [{ googleSearch: {} }],
  generationConfig: {
    responseMimeType: 'application/json'
  }
});

async function refineVenue(venueSlug: string) {
  const venuePath = path.join(__dirname, '../data', venueSlug);

  if (!fs.existsSync(venuePath)) {
    console.error('Error: Folder not found at ' + venuePath);
    return;
  }

  console.log('🏭 Refining Data for: ' + venueSlug + ' (V7 Surveyor Mode)...');

  // STEP 1: THE SURVEYOR (Google Places API)
  let googleData = null;
  const placesDumpPath = path.join(venuePath, 'google_places_dump.json');

  try {
    // Convert slug to readable name (e.g. hannahs -> Hannah's Olympia)
    const searchQuery = venueSlug.replace(/_/g, ' ') + ' Olympia WA';
    console.log('   🗺️  Surveying Google Places for: ' + searchQuery);

    const placeId = await placesService.findPlaceId(searchQuery);

    if (placeId) {
      googleData = await placesService.getPlaceDetails(placeId);
      fs.writeFileSync(placesDumpPath, JSON.stringify(googleData, null, 2));
      console.log('   ✅ Google Places Data Acquired & Saved.');
    } else {
      console.log('   ⚠️  Place ID not found via API.');
    }
  } catch (err) {
    console.error('   ❌ Google Places API Error:', err);
  }

  // STEP 2: THE DETECTIVE (Gemini + Local Files)
  // FIX: Sort files to ensure chronological order for 'Rolling Canon' logic
  const files = fs.readdirSync(venuePath).sort();
  const promptParts: any[] = [];

  promptParts.push({ text: schemaInstructions });

  // Feed Google Data as Hard Fact
  if (googleData) {
    promptParts.push({
      text: '[OFFICIAL GOOGLE PLACES API DATA - HIGH CONFIDENCE]\n' + JSON.stringify(googleData)
    });
  }

  let foundContent = false;

  for (const file of files) {
    const filePath = path.join(venuePath, file);

    // Skip the output files to avoid feedback loops
    if (file === 'data.json' || file === 'google_places_dump.json') continue;

    if (file.endsWith('.txt')) {
      const textContent = fs.readFileSync(filePath, 'utf-8');
      promptParts.push({ text: '[INPUT SOURCE: ' + file + ']\n' + textContent });
      foundContent = true;
      console.log('   📄 Loaded Text: ' + file);
    }
    else if (file.match(/\.(png|jpg|jpeg|webp)$/i)) {
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString('base64');
      promptParts.push({
        inlineData: {
          mimeType: file.endsWith('png') ? 'image/png' : 'image/jpeg',
          data: base64Image
        }
      });
      foundContent = true;
      console.log('   📸 Loaded Image: ' + file);
    }
  }

  if (!foundContent && !googleData) {
    console.log('Warning: No content found in ' + venuePath);
    return;
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: promptParts }]
    });

    const response = result.response;
    let jsonOutput = response.text().trim();

    // Clean up markdown markers if present
    if (jsonOutput.startsWith('```')) {
      jsonOutput = jsonOutput.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    // Find the actual JSON object bounds to avoid trailing text or multiple objects
    const firstBrace = jsonOutput.indexOf('{');
    if (firstBrace !== -1) {
      let braceCount = 0;
      let lastBracePos = -1;
      for (let i = firstBrace; i < jsonOutput.length; i++) {
        if (jsonOutput[i] === '{') braceCount++;
        else if (jsonOutput[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            lastBracePos = i;
            break;
          }
        }
      }
      if (lastBracePos !== -1) {
        jsonOutput = jsonOutput.substring(firstBrace, lastBracePos + 1);
      }
    }

    try {
      JSON.parse(jsonOutput);
      fs.writeFileSync(path.join(venuePath, 'data.json'), jsonOutput);
      console.log('✅ Success! Profile saved to data.json');
    } catch (parseErr) {
      console.error('❌ JSON Parse Error. Raw output was:', jsonOutput);
      fs.writeFileSync(path.join(venuePath, 'raw_error_output.txt'), jsonOutput);
    }

  } catch (error) {
    console.error('Refine Error:', error);
  }
}

const venueArg = process.argv[2] || 'hannahs';
refineVenue(venueArg);
