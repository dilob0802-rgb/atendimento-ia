import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const targetEmail = 'final@teste.com';
    console.log(`Searching for user with email: ${targetEmail}`);

    const { data: users, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', targetEmail);

    let out = `Search results for ${targetEmail}:\n`;
    if (users && users.length > 0) {
        out += `Found ${users.length} users:\n`;
        users.forEach(u => {
            out += `- ID: ${u.id}\n  Email: ${u.email}\n  Empresa ID: ${u.empresa_id}\n  Role: ${u.role}\n  Ativo: ${u.ativo}\n`;
        });
    } else {
        out += 'No users found with this email.\n';
    }

    // Also listing all users to be sure
    const { data: allUsers } = await await supabase.from('usuarios').select('email, empresa_id');
    out += `\nTotal users in system: ${allUsers?.length}\n`;
    allUsers.forEach(u => out += ` - ${u.email} (Empresa: ${u.empresa_id})\n`);

    fs.writeFileSync('debug_output_2.txt', out);
    console.log('Written to debug_output_2.txt');
}

debug();
