import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis SUPABASE_URL e SUPABASE_KEY não configuradas!');
    console.log('📝 Configure o arquivo .env com suas credenciais do Supabase');
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Testa a conexão
export async function testConnection() {
    try {
        const { data, error } = await supabase.from('empresas').select('count');
        if (error) throw error;
        console.log('✅ Supabase conectado com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com Supabase:', error.message);
        return false;
    }
}
