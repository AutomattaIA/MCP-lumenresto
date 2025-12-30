import { z } from 'zod';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL debe ser una URL válida'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY es requerida'),
  
  // API Auth
  API_KEY: z.string().min(32, 'API_KEY debe tener al menos 32 caracteres'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Error en variables de entorno:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const config = {
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
  },
  supabase: {
    url: env.SUPABASE_URL,
    serviceKey: env.SUPABASE_SERVICE_KEY,
  },
  api: {
    key: env.API_KEY,
  },
} as const;

// Validar que las URLs sean válidas
try {
  new URL(config.supabase.url);
} catch {
  console.error('❌ SUPABASE_URL no es una URL válida');
  process.exit(1);
}