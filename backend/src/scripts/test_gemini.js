import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing Gemini API with key:', apiKey ? 'Present' : 'Missing');

async function testGemini() {
    if (!apiKey) {
        console.error('No API Key');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using the problematic model name
        const modelName = 'gemini-2.5-flash';
        console.log(`Attempting to use model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        console.log('Success:', response.text());
    } catch (error) {
        console.error('Error with gemini-2.5-flash:', error.message);

        // Try fallback
        try {
            console.log('Trying fallback: gemini-1.5-flash');
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent('Say hello');
            console.log('Success with gemini-1.5-flash:', result.response.text());
        } catch (err2) {
            console.error('Error with gemini-1.5-flash:', err2.message);
        }
    }
}

testGemini();
