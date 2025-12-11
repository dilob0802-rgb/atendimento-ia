import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Key length:', apiKey ? apiKey.length : 0);
console.log('Key start:', apiKey ? apiKey.substring(0, 5) : 'None');
