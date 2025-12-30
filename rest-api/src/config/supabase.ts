import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

// Crear cliente Supabase con service role key
// IMPORTANTE: Esta key tiene permisos completos, solo usar en backend
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  }
);

// Función de salud para verificar conexión
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('restaurants').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no existe (OK para health check)
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

