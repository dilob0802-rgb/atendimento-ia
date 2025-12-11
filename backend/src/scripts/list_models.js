import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    const logFile = 'gemini_models.txt';
    let output = '';

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        output += JSON.stringify(data, null, 2);
    } catch (error) {
        output += `Error: ${error.message}`;
    }

    fs.writeFileSync(logFile, output);
    console.log('Written ' + logFile);
}

listModels();
