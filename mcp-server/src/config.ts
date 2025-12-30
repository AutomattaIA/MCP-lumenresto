import dotenv from 'dotenv';
import { z } from 'zod';

// Cargar variables de entorno
dotenv.config();

const envSchema = z.object({
  RAILWAY_API_URL: z.string().url('RAILWAY_API_URL debe ser una URL válida'),
  API_KEY: z.string().min(1, 'API_KEY es requerida'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Error en variables de entorno del MCP Server:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const config = {
  railwayApiUrl: env.RAILWAY_API_URL.replace(/\/$/, ''), // Remover trailing slash
  apiKey: env.API_KEY,
} as const;

