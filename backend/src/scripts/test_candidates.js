import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function testModels() {
    const logFile = 'gemini_model_test_full.txt';
    let output = '';
    const genAI = new GoogleGenerativeAI(apiKey);

    // Derived from the list we saw
    const candidates = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];

    for (const modelName of candidates) {
        output += `\nTesting ${modelName}...\n`;
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Simple prompt
            const result = await model.generateContent('Hi');
            const response = await result.response;
            output += `SUCCESS: ${response.text()}\n`;
        } catch (error) {
            output += `FAIL: ${error.message}\n`;
            if (error.response) {
                output += `Args: ${JSON.stringify(error.response)}\n`;
            }
        }
    }

    fs.writeFileSync(logFile, output);
    console.log('Written ' + logFile);
}

testModels();
