# Guía de Deployment

Esta guía te ayudará a desplegar el proyecto completo paso a paso.

## 📋 Checklist Pre-Deployment

- [ ] Cuenta de Railway creada
- [ ] Cuenta de Supabase creada
- [ ] Base de datos configurada con todas las tablas necesarias
- [ ] Variables de entorno preparadas
- [ ] Código probado localmente

## 🗄️ Paso 1: Configurar Supabase

### 1.1 Crear Base de Datos

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Esperar a que se cree la base de datos (2-3 minutos)

### 1.2 Crear Tablas

Ejecutar estos SQL statements en el SQL Editor de Supabase:

```sql
-- Tabla de restaurantes
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de horarios de negocio
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, day_of_week)
);

-- Tabla de mesas
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, table_number)
);

-- Tabla de reservas
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  reservation_date TIMESTAMPTZ NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0 AND party_size <= 50),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 30 AND duration_minutes <= 480) DEFAULT 120,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_reservations_restaurant_date ON reservations(restaurant_id, reservation_date);
CREATE INDEX idx_reservations_table_date ON reservations(table_id, reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_tables_restaurant_active ON tables(restaurant_id, is_active);
CREATE INDEX idx_business_hours_restaurant_day ON business_hours(restaurant_id, day_of_week);
```

### 1.3 Insertar Datos de Prueba

```sql
-- Insertar restaurante de prueba
INSERT INTO restaurants (id, name, is_active) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Lumen Resto Principal', true);

-- Insertar horarios (lunes a domingo, 12:00 - 23:00)
INSERT INTO business_hours (restaurant_id, day_of_week, open_time, close_time, is_closed)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 0, '12:00', '23:00', false), -- Domingo
  ('00000000-0000-0000-0000-000000000001', 1, '12:00', '23:00', false), -- Lunes
  ('00000000-0000-0000-0000-000000000001', 2, '12:00', '23:00', false), -- Martes
  ('00000000-0000-0000-0000-000000000001', 3, '12:00', '23:00', false), -- Miércoles
  ('00000000-0000-0000-0000-000000000001', 4, '12:00', '23:00', false), -- Jueves
  ('00000000-0000-0000-0000-000000000001', 5, '12:00', '23:00', false), -- Viernes
  ('00000000-0000-0000-0000-000000000001', 6, '12:00', '23:00', false); -- Sábado

-- Insertar mesas de prueba
INSERT INTO tables (restaurant_id, table_number, capacity, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 1, 2, true),
  ('00000000-0000-0000-0000-000000000001', 2, 2, true),
  ('00000000-0000-0000-0000-000000000001', 3, 4, true),
  ('00000000-0000-0000-0000-000000000001', 4, 4, true),
  ('00000000-0000-0000-0000-000000000001', 5, 6, true),
  ('00000000-0000-0000-0000-000000000001', 6, 8, true);
```

### 1.4 Obtener Credenciales

1. Ir a **Settings** → **API**
2. Copiar **Project URL** (ej: `https://xxxxx.supabase.co`)
3. Copiar **service_role** key (⚠️ Esta key tiene permisos completos, solo usarla en backend)

## 🚂 Paso 2: Deploy en Railway

### 2.1 Crear Proyecto en Railway

1. Ir a [railway.app](https://railway.app)
2. Sign in con GitHub
3. Click en **"New Project"**
4. Seleccionar **"Deploy from GitHub repo"** (recomendado) o **"Empty Project"**

### 2.2 Configurar Deployment

Si usaste "Deploy from GitHub repo":
- Seleccionar el repositorio
- Railway detecta automáticamente Node.js
- Seleccionar el directorio `rest-api` como raíz del proyecto

Si usaste "Empty Project":
1. Click en **"New"** → **"GitHub Repo"**
2. Seleccionar repositorio
3. En configuración del servicio, cambiar **Root Directory** a `rest-api`

### 2.3 Configurar Variables de Entorno

En Railway Dashboard, ir a **Variables** y agregar:

```env
NODE_ENV=production
PORT=3000

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

API_KEY=tu-api-key-secreta-muy-larga-y-segura
```

**Generar API_KEY segura:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Verificar Deployment

1. Railway automáticamente construye y despliega
2. Esperar a que el deployment termine (ver logs en Railway Dashboard)
3. Railway asigna una URL pública (ej: `https://lumen-resto-production.up.railway.app`)
4. Probar health check:
```bash
curl https://tu-app.railway.app/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected"
  }
}
```

### 2.5 (Opcional) Configurar Dominio Personalizado

1. En Railway Dashboard → **Settings** → **Domains**
2. Click en **"Generate Domain"** o agregar dominio personalizado
3. Configurar DNS según instrucciones

## 🔧 Paso 3: Configurar MCP Server Local

### 3.1 Build del MCP Server

```bash
cd mcp-server
npm install
npm run build
```

### 3.2 Configurar Variables de Entorno

Crear archivo `mcp-server/.env`:

```env
RAILWAY_API_URL=https://tu-app.railway.app
API_KEY=tu-api-key-secreta-muy-larga-y-segura
```

### 3.3 Configurar en Cursor

1. Abrir Cursor
2. Ir a configuración (Settings)
3. Buscar "MCP" o editar directamente `~/.cursor/mcp_settings.json`

**Windows:**
```
C:\Users\Usuario\.cursor\mcp_settings.json
```

**macOS/Linux:**
```
~/.cursor/mcp_settings.json
```

4. Agregar configuración:

```json
{
  "mcpServers": {
    "lumen-resto": {
      "command": "node",
      "args": ["C:/Users/Usuario/Documents/GitHub/MCP-lumenresto/mcp-server/dist/index.js"],
      "env": {
        "RAILWAY_API_URL": "https://tu-app.railway.app",
        "API_KEY": "tu-api-key-secreta-muy-larga-y-segura"
      }
    }
  }
}
```

**⚠️ Importante:** Usar ruta **absoluta** al archivo `dist/index.js`

5. Reiniciar Cursor

## 🎙️ Paso 4: Configurar ElevenLabs

Seguir la guía detallada en [ELEVENLABS_SETUP.md](ELEVENLABS_SETUP.md)

## ✅ Paso 5: Verificación Final

### 5.1 Probar Railway API

```bash
# Health check
curl https://tu-app.railway.app/health

# Check schedule (requiere API key)
curl -X POST https://tu-app.railway.app/api/check-schedule \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu-api-key" \
  -d '{
    "restaurant_id": "00000000-0000-0000-0000-000000000001",
    "date": "2024-01-20T19:00:00.000Z"
  }'
```

### 5.2 Probar MCP en Cursor

1. Abrir Cursor
2. En el chat, escribir:
```
@lumen-resto consulta los horarios disponibles para el restaurante 
00000000-0000-0000-0000-000000000001 para mañana
```

3. Verificar que Cursor llama la tool correctamente

### 5.3 Probar ElevenLabs Agent

1. Ir a ElevenLabs Dashboard
2. Abrir el agente creado
3. Usar el simulador de voz
4. Hacer una conversación de prueba
5. Verificar que se crea la reserva en Supabase

## 🐛 Troubleshooting

### Railway: Build falla

**Verificar:**
- Node.js 20+ está especificado en `package.json` → `engines`
- Todas las dependencias están en `dependencies` (no `devDependencies`)
- El build command es correcto en `railway.json`

### Railway: Health check falla

**Verificar:**
- Variables de entorno están configuradas correctamente
- Supabase URL y service key son válidos
- Logs en Railway Dashboard para errores específicos

### MCP: No aparece en Cursor

**Verificar:**
- Ruta absoluta es correcta
- `npm run build` se ejecutó exitosamente
- Variables de entorno están en `mcp_settings.json`
- Cursor fue reiniciado después de configurar

### ElevenLabs: Tool calls fallan

**Verificar:**
- URL de Railway API es correcta y accesible
- API_KEY en ElevenLabs coincide con Railway
- Headers están configurados correctamente
- Formato de parámetros es correcto

## 📊 Monitoreo

### Railway Logs

- Ver logs en tiempo real en Railway Dashboard
- Configurar alertas para errores críticos

### Supabase Dashboard

- Monitorear uso de base de datos
- Ver queries lentas
- Revisar métricas de conexiones

### ElevenLabs Dashboard

- Monitorear uso de caracteres
- Ver logs de tool calls
- Revisar métricas de conversaciones

