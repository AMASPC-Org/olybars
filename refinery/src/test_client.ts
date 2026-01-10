import { GoogleGenAI } from '@google/genai';
const client = new GoogleGenAI({ apiKey: 'test' });
console.log('Client methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
