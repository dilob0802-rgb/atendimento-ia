import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Debugging Empresa and User ---');

    // 1. Find company 'final'
    const { data: empresas, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .ilike('nome', '%final%');

    if (empresaError) {
        console.error('Error fetching empresa:', empresaError);
        return;
    }

    if (empresas.length === 0) {
        console.log('No empresa found');
        return;
    }

    const empresa = empresas[0];

    // 2. Find users for this empresa
    const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('empresa_id', empresa.id);

    // 3. Test the specific query used in the backend
    const { data: queryResult, error: queryError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('empresa_id', empresa.id)
        .eq('role', 'client')
        .single();

    const out = `
Found ${empresas.length} empresas matching 'final':
${empresas.map(e => `- [${e.id}] ${e.nome} (Email: ${e.email})`).join('\n')}

Found ${users.length} users for empresa ${empresa.id}:
${users.map(u => `- [${u.id}] ${u.email} | Role: ${u.role} | Active: ${u.ativo}`).join('\n')}

Backend Query Result (single check): ${queryError ? 'Error ' + queryError.code + ' ' + queryError.message : 'Success ' + queryResult?.id}
    `;

    fs.writeFileSync('debug_output.txt', out);
    console.log('Output written to debug_output.txt');
}

debug();
