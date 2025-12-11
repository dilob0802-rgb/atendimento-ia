import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini() {
    const logFile = 'gemini_test_output.txt';
    let output = `Testing API Key: ${apiKey ? 'Present' : 'Missing'}\n`;

    if (!apiKey) {
        fs.writeFileSync(logFile, output + 'No API Key');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = 'gemini-1.5-flash';
        output += `Model: ${modelName}\n`;

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        output += `Success! Response: ${response.text()}\n`;
    } catch (error) {
        output += `ERROR: ${error.message}\n`;
        output += `Full stack: ${error.stack}\n`;
        if (error.response) {
            output += `API Response: ${JSON.stringify(error.response, null, 2)}\n`;
        }
    }

    fs.writeFileSync(logFile, output);
    console.log('Done, written to ' + logFile);
}

testGemini();
