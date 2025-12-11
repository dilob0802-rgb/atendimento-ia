import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini() {
    console.log('Testing Model: gemini-2.5-flash');
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Testing the model configured in the main functionality
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        console.log('Success:', response.text());
    } catch (error) {
        console.error('FAILED with gemini-2.5-flash');
        console.error('Error Details:', error.message);

        console.log('\n--- Retrying with gemini-1.5-flash ---');
        try {
            const model15 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result15 = await model15.generateContent('Say hello');
            console.log('Success with gemini-1.5-flash:', result15.response.text());
        } catch (e2) {
            console.error('Also failed with gemini-1.5-flash:', e2.message);
        }
    }
}

testGemini();
