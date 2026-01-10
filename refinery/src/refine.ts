import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { schemaInstructions } from './schema.js';
import { REFINERY_CONSTITUTION } from './rules.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize Model with System Instructions and Google Search Tool
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  systemInstruction: {
    parts: [{ text: REFINERY_CONSTITUTION + '\n' + schemaInstructions }],
    role: 'system'
  },
  // @ts-ignore
  tools: [{ googleSearch: {} }],
  generationConfig: { responseMimeType: 'application/json' }
});

async function refineVenue(venueSlug: string) {
  const venuePath = path.join(__dirname, '../data', venueSlug);

  if (!fs.existsSync(venuePath)) {
    console.error('? Error: Folder not found at ' + venuePath);
    return;
  }

  console.log('?? Refining Data for: ' + venueSlug + '...');

  // Prepare the Prompt (User Data only)
  const files = fs.readdirSync(venuePath);
  const promptParts: any[] = [];

  let foundContent = false;

  for (const file of files) {
    const filePath = path.join(venuePath, file);

    // Ignore output files and hidden files
    if (file === 'data.json' || file === 'raw_error_output.txt' || file.startsWith('.')) continue;

    // Ingest Text Files (Raw Intel)
    if (file.endsWith('.txt')) {
      const textContent = fs.readFileSync(filePath, 'utf-8');
      promptParts.push({ text: '[INPUT SOURCE: ' + file + ']\n' + textContent });
      foundContent = true;
      console.log('   ?? Loaded Text: ' + file);
    }
    // Ingest Images (Menus/Vibe)
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
      console.log('   ?? Loaded Image: ' + file);
    }
  }

  if (!foundContent) {
    console.log("??  No text or images found in folder. Please add raw_intel.txt or images.");
    return;
  }

  try {
    console.log("? Analyzing with Gemini 2.0 (Reading images + Googling facts)...");
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: promptParts }]
    });

    const response = result.response;
    let jsonOutput = response.text().trim();

    // Clean up markdown markers if present (some models still include them)
    if (jsonOutput.startsWith('```')) {
      jsonOutput = jsonOutput.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    // Find the actual JSON object bounds
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
      // Validate and Save
      JSON.parse(jsonOutput);
      fs.writeFileSync(path.join(venuePath, 'data.json'), jsonOutput);
      console.log('? Success! Profile saved to ' + venueSlug + '/data.json');

      // Cleanup error log if it exists from a previous failed run
      const errorLogPath = path.join(venuePath, 'raw_error_output.txt');
      if (fs.existsSync(errorLogPath)) {
        fs.unlinkSync(errorLogPath);
      }
    } catch (parseErr) {
      console.error('? JSON Parse Error. Raw output was:', jsonOutput);
      fs.writeFileSync(path.join(venuePath, 'raw_error_output.txt'), jsonOutput);
    }

    if (response.candidates && response.candidates[0].groundingMetadata) {
      console.log('?? Grounding Sources Used:', response.candidates[0].groundingMetadata.searchEntryPoint);
    }

  } catch (error) {
    console.error('? AI Error:', error);
  }
}

// Default run
const venueArg = process.argv[2] || 'hannahs';
refineVenue(venueArg);
