# Lumen Resto REST API

API REST para gestionar reservas de Lumen Resto. Desplegada en Railway y accesible públicamente vía HTTPS.

## 🚀 Inicio Rápido

### Desarrollo Local

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp ../.env.example .env
# Editar .env con tus credenciales
```

3. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

4. **Verificar que funciona:**
```bash
curl http://localhost:3000/health
```

### Build y Producción

```bash
npm run build
npm start
```

## 📚 Endpoints

### `GET /health`

Health check endpoint. No requiere autenticación.

**Response:**
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

### `POST /api/check-schedule`

Consulta horarios disponibles para un restaurante en una fecha específica.

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "restaurant_id": "uuid-del-restaurante",
  "date": "2024-01-20T19:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "time_slots": [
      {
        "time": "2024-01-20T19:00:00.000Z",
        "available": true
      },
      {
        "time": "2024-01-20T19:30:00.000Z",
        "available": false
      }
    ],
    "message": "Encontré 3 horarios disponibles: 19:00, 20:00, 21:00"
  }
}
```

### `POST /api/create-reservation`

Crea una nueva reserva con asignación automática de mesa.

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "restaurant_id": "uuid-del-restaurante",
  "client_id": "uuid-del-cliente",
  "reservation_date": "2024-01-20T20:00:00.000Z",
  "party_size": 4,
  "duration_minutes": 120
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "reservation_id": "uuid-de-la-reserva",
    "table_number": 5,
    "reservation_date": "2024-01-20T20:00:00.000Z",
    "party_size": 4,
    "message": "Reserva confirmada para 4 personas en la mesa 5 el lunes, 20 de enero de 2024, 20:00"
  }
}
```

## 🔐 Autenticación

Todos los endpoints bajo `/api/*` requieren el header `X-API-Key` con un valor válido.

Configura la API key en la variable de entorno `API_KEY`.

## 🗄️ Esquema de Base de Datos Requerido

El API asume las siguientes tablas en Supabase:

### `restaurants`
- `id` (uuid, PK)
- `name` (text)
- `is_active` (boolean)

### `business_hours`
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK → restaurants)
- `day_of_week` (integer, 0-6)
- `open_time` (time)
- `close_time` (time)
- `is_closed` (boolean)

### `tables`
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK → restaurants)
- `table_number` (integer)
- `capacity` (integer)
- `is_active` (boolean)

### `reservations`
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK → restaurants)
- `client_id` (uuid)
- `table_id` (uuid, FK → tables)
- `reservation_date` (timestamptz)
- `party_size` (integer)
- `duration_minutes` (integer)
- `status` (text: 'pending' | 'confirmed' | 'cancelled' | 'completed')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 🚢 Deploy en Railway

1. Crear proyecto en Railway
2. Conectar repositorio o subir código
3. Configurar variables de entorno en Railway Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `API_KEY`
   - `NODE_ENV=production`
4. Railway auto-detecta `package.json` y despliega

## 🐛 Troubleshooting

### Error: "Restaurante no encontrado"
- Verifica que el `restaurant_id` existe en la tabla `restaurants`
- Verifica que `SUPABASE_SERVICE_KEY` tiene permisos de lectura

### Error: "No hay mesas disponibles"
- Verifica que existen mesas en la tabla `tables` con `is_active = true`
- Verifica que la capacidad de las mesas es >= `party_size`
- Verifica que no hay reservas solapadas en el horario solicitado

### Error: "X-API-Key inválido"
- Verifica que estás enviando el header `X-API-Key`
- Verifica que el valor coincide con `API_KEY` en variables de entorno

