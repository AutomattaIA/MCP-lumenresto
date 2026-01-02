# Configuración de Variables de Entorno en Railway

## ⚠️ Variables Requeridas

Para que la API funcione correctamente, debes configurar estas variables en Railway:

### 1. Ir a Railway Dashboard

1. Abre [railway.app](https://railway.app)
2. Selecciona tu proyecto
3. Selecciona el servicio `lumen-resto-api` (o el nombre que le hayas dado)
4. Ve a la pestaña **Variables**

### 2. Agregar Variables

Haz clic en **"New Variable"** y agrega cada una de estas variables:

#### `SUPABASE_URL`
- **Valor:** La URL de tu proyecto Supabase
- **Ejemplo:** `https://xxxxx.supabase.co`
- **Dónde obtenerla:** Supabase Dashboard → Settings → API → Project URL

#### `SUPABASE_SERVICE_KEY`
- **Valor:** La service role key de Supabase (⚠️ Esta key tiene permisos completos)
- **Ejemplo:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Dónde obtenerla:** Supabase Dashboard → Settings → API → service_role key
- **⚠️ Importante:** Usa la key de **service_role**, NO la anon key

#### `API_KEY`
- **Valor:** Una API key secreta de al menos 32 caracteres
- **Generar una nueva:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Ejemplo:** `428b51f8-3699-4306-b0c5-3b52a0c2e508` (pero genera una nueva para producción)

### 3. Variables Opcionales (con valores por defecto)

Estas variables tienen valores por defecto, pero puedes configurarlas si lo necesitas:

#### `NODE_ENV`
- **Valor por defecto:** `development`
- **Recomendado para producción:** `production`

#### `PORT`
- **Valor por defecto:** `3000`
- **Nota:** Railway asigna automáticamente un puerto, pero puedes configurarlo si necesitas uno específico

## ✅ Verificación

Después de configurar las variables:

1. Railway reiniciará automáticamente el servicio
2. Espera a que el deployment termine
3. Verifica los logs en Railway Dashboard
4. Prueba el health check:
   ```bash
   curl https://tu-dominio-railway.up.railway.app/health
   ```

## 🔍 Troubleshooting

### Error: "SUPABASE_URL: Required"
- Verifica que agregaste la variable `SUPABASE_URL` en Railway
- Asegúrate de que la URL sea válida (debe empezar con `https://`)

### Error: "SUPABASE_SERVICE_KEY: Required"
- Verifica que agregaste la variable `SUPABASE_SERVICE_KEY` en Railway
- Asegúrate de usar la **service_role** key, no la anon key

### Error: "API_KEY debe tener al menos 32 caracteres"
- Genera una nueva API key con el comando mostrado arriba
- Asegúrate de que tenga al menos 32 caracteres

### El servicio no inicia después de agregar variables
- Verifica que no haya espacios extra en los valores
- Verifica que las URLs no tengan trailing slashes innecesarios
- Revisa los logs en Railway Dashboard para ver el error específico

