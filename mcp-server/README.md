# Lumen Resto MCP Server

Servidor MCP (Model Context Protocol) para integración con Cursor IDE. Permite consultar horarios y crear reservas de Lumen Resto directamente desde Cursor.

## 🚀 Instalación

### 1. Build del proyecto

```bash
npm install
npm run build
```

### 2. Configurar variables de entorno

Crear archivo `.env` en `mcp-server/`:

```env
RAILWAY_API_URL=https://tu-app.railway.app
API_KEY=tu-api-key-secreta
```

### 3. Configurar en Cursor

Editar `~/.cursor/mcp_settings.json` (o la ruta equivalente en Windows):

```json
{
  "mcpServers": {
    "lumen-resto": {
      "command": "node",
      "args": ["C:/ruta/completa/MCP-lumenresto/mcp-server/dist/index.js"],
      "env": {
        "RAILWAY_API_URL": "https://tu-app.railway.app",
        "API_KEY": "tu-api-key-secreta"
      }
    }
  }
}
```

**Importante:** Usar la ruta **absoluta** al archivo `dist/index.js`.

### 4. Reiniciar Cursor

Cerrar y reabrir Cursor para que cargue el servidor MCP.

## 📚 Tools Disponibles

### `check_restaurant_schedule`

Consulta los horarios disponibles de un restaurante para una fecha específica.

**Parámetros:**
- `restaurant_id` (string): UUID del restaurante
- `date` (string): Fecha en formato ISO 8601

**Ejemplo de uso en Cursor:**
```
@lumen-resto consulta los horarios disponibles para el restaurante 
abc123-...-xyz789 para mañana
```

### `create_reservation`

Crea una nueva reserva con asignación automática de mesa.

**Parámetros:**
- `restaurant_id` (string): UUID del restaurante
- `client_id` (string): UUID del cliente
- `reservation_date` (string): Fecha y hora en formato ISO 8601
- `party_size` (number): Número de personas (1-50)
- `duration_minutes` (number, opcional): Duración en minutos (30-480). Default: 120

**Ejemplo de uso en Cursor:**
```
@lumen-resto crea una reserva para 4 personas mañana a las 8 PM 
en el restaurante abc123-...-xyz789 para el cliente def456-...-uvw012
```

## 🔧 Desarrollo

### Modo desarrollo

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Verificar tipos

```bash
npm run type-check
```

## 🐛 Troubleshooting

### El servidor MCP no aparece en Cursor

1. Verifica que el archivo `dist/index.js` existe después de hacer `npm run build`
2. Verifica que la ruta en `mcp_settings.json` es **absoluta** y correcta
3. Verifica que las variables de entorno están configuradas
4. Revisa los logs de Cursor (consola de desarrollador) para errores

### Error: "Cannot find module"

Asegúrate de haber ejecutado `npm install` y `npm run build` en el directorio `mcp-server/`.

### Error: "RAILWAY_API_URL debe ser una URL válida"

Verifica que `RAILWAY_API_URL` en `.env` es una URL completa (ej: `https://tu-app.railway.app`), no solo un dominio.

### El servidor no puede conectarse a Railway API

1. Verifica que Railway API está corriendo: `curl https://tu-app.railway.app/health`
2. Verifica que `API_KEY` en `.env` coincide con la configurada en Railway
3. Verifica que no hay problemas de firewall o red

