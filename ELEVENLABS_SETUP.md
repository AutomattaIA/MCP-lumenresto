# Guía de Integración con ElevenLabs

Esta guía te ayudará a configurar el agente de voz conversacional de ElevenLabs para Lumen Resto.

## 📋 Prerrequisitos

1. **Railway API desplegada y funcionando**
   - Debes tener la URL pública (ej: `https://tu-app.railway.app`)
   - Debes tener configurada la `API_KEY`

2. **Cuenta de ElevenLabs**
   - Crear cuenta en [elevenlabs.io](https://elevenlabs.io)
   - Plan recomendado: Starter ($5/mes) o Creator ($22/mes)

## 🚀 Paso 1: Crear Agente en ElevenLabs

1. **Ir a ElevenLabs Dashboard:**
   - Iniciar sesión en [elevenlabs.io](https://elevenlabs.io)
   - Navegar a "Conversational AI" → "Agents"

2. **Crear nuevo agente:**
   - Click en "Create Agent"
   - Nombre: "Lumen Resto Reservations"
   - Descripción: "Asistente de reservas para restaurante Lumen Resto"

3. **Configurar voz:**
   - Seleccionar voz en español (recomendado: alguna voz natural y profesional)
   - Ajustar velocidad y tono según preferencia

4. **Configurar personalidad (System Prompt):**
```
Eres el asistente de reservas del restaurante Lumen Resto. Tu trabajo es ayudar a los clientes a consultar disponibilidad y crear reservas de forma amigable y profesional.

Instrucciones:
- Siempre sé amigable y profesional
- Cuando consultes horarios, usa la tool check_restaurant_schedule
- Cuando crees reservas, usa la tool create_reservation
- Proporciona información clara sobre horarios y confirmaciones
- Si hay algún error, explica amigablemente qué salió mal
- Habla en español de forma natural y conversacional
```

## 🔧 Paso 2: Configurar Custom Tools

### Tool 1: check_restaurant_schedule

1. En la configuración del agente, ir a "Tools" → "Custom Tools" → "Add Tool"

2. **Configuración:**
   - **Name:** `check_restaurant_schedule`
   - **Description:** `Consulta los horarios disponibles de un restaurante para una fecha específica`
   - **URL:** `https://tu-app.railway.app/api/check-schedule`
   - **Method:** `POST`
   - **Headers:**
     - Key: `X-API-Key`
     - Value: `tu-api-key-aqui` (la misma que configuraste en Railway)
     - Key: `Content-Type`
     - Value: `application/json`

3. **Parameters:**
   - `restaurant_id`
     - Type: `string`
     - Description: `UUID del restaurante`
     - Required: ✅ Yes
   
   - `date`
     - Type: `string`
     - Description: `Fecha en formato ISO 8601 (ej: 2024-01-20T19:00:00.000Z)`
     - Required: ✅ Yes

### Tool 2: create_reservation

1. Agregar otra custom tool

2. **Configuración:**
   - **Name:** `create_reservation`
   - **Description:** `Crea una nueva reserva en el restaurante con asignación automática de mesa`
   - **URL:** `https://tu-app.railway.app/api/create-reservation`
   - **Method:** `POST`
   - **Headers:**
     - Key: `X-API-Key`
     - Value: `tu-api-key-aqui`
     - Key: `Content-Type`
     - Value: `application/json`

3. **Parameters:**
   - `restaurant_id`
     - Type: `string`
     - Description: `UUID del restaurante`
     - Required: ✅ Yes
   
   - `client_id`
     - Type: `string`
     - Description: `UUID del cliente`
     - Required: ✅ Yes
   
   - `reservation_date`
     - Type: `string`
     - Description: `Fecha y hora de la reserva en formato ISO 8601`
     - Required: ✅ Yes
   
   - `party_size`
     - Type: `number`
     - Description: `Número de personas (1-50)`
     - Required: ✅ Yes
   
   - `duration_minutes`
     - Type: `number`
     - Description: `Duración de la reserva en minutos (30-480). Default: 120`
     - Required: ❌ No

## ✅ Paso 3: Probar el Agente

1. **Usar el simulador de voz de ElevenLabs:**
   - En la configuración del agente, ir a "Test Agent"
   - Hacer click en el botón de grabación o escribir texto

2. **Prueba de conversación:**
   ```
   Usuario: "Hola, ¿tienen mesa disponible para mañana a las 8 PM?"
   
   Agente: [llama check_restaurant_schedule]
   "Sí, tenemos disponibilidad. Encontré varios horarios disponibles: 
   19:00, 19:30, 20:00, 20:30, 21:00. ¿Te gustaría reservar algún horario?"
   
   Usuario: "Perfecto, quiero reservar para 4 personas a las 8 PM"
   
   Agente: [llama create_reservation]
   "Perfecto, tu reserva está confirmada para 4 personas en la mesa 5 
   el lunes, 20 de enero de 2024, 20:00. ¡Te esperamos!"
   ```

3. **Verificar en Supabase:**
   - Verificar que la reserva se creó correctamente en la tabla `reservations`
   - Verificar que se asignó una mesa apropiada

## 🔍 Troubleshooting

### Error: "Tool call failed"

**Causa:** El endpoint de Railway no está accesible o la API key es incorrecta.

**Solución:**
1. Verificar que Railway API está corriendo: `curl https://tu-app.railway.app/health`
2. Verificar que `X-API-Key` en ElevenLabs coincide con `API_KEY` en Railway
3. Revisar logs de Railway para errores

### Error: "Invalid date format"

**Causa:** El formato de fecha no es ISO 8601.

**Solución:** Asegúrate de que el agente esté enviando fechas en formato ISO 8601 (ej: `2024-01-20T20:00:00.000Z`)

### El agente no llama las tools

**Causa:** La descripción de las tools no es suficientemente clara para el LLM.

**Solución:**
1. Mejorar las descripciones de las tools
2. Ajustar el system prompt para ser más explícito sobre cuándo usar cada tool
3. Probar con ejemplos más claros en la conversación

### Error 401 Unauthorized

**Causa:** La API key no está configurada correctamente.

**Solución:**
1. Verificar que el header `X-API-Key` está configurado en ElevenLabs
2. Verificar que el valor coincide exactamente con `API_KEY` en Railway
3. Verificar que no hay espacios adicionales en la configuración

## 📊 Monitoreo y Costos

### Costos Estimados de ElevenLabs

| Plan | Caracteres/mes | Costo | Uso Estimado |
|------|----------------|-------|--------------|
| Free | 10,000 | $0 | ~50 conversaciones |
| Starter | 100,000 | $5 | ~500 conversaciones |
| Creator | 500,000 | $22 | ~2,500 conversaciones |
| Pro | 2,000,000 | $99 | ~10,000 conversaciones |

**Estimación para Lumen Resto:**
- Conversación promedio: 200-400 caracteres (respuestas del agente)
- 100 reservas telefónicas/mes ≈ 20,000-40,000 caracteres
- **Recomendado: Plan Starter ($5/mes) o Creator ($22/mes)**

### Métricas a Monitorear

1. **Uso de caracteres en ElevenLabs Dashboard**
2. **Tasa de éxito de tool calls** (tools que se ejecutan correctamente)
3. **Latencia de respuestas** (tiempo entre pregunta y respuesta)
4. **Reservas creadas vs intentos** (conversión)

## 🔐 Seguridad

1. **Nunca expongas la API_KEY públicamente**
2. **Usa HTTPS siempre** (Railway lo proporciona automáticamente)
3. **Considera implementar rate limiting** en Railway API para prevenir abusos
4. **Monitorea los logs de Railway** para detectar intentos sospechosos

## 📝 Notas Adicionales

- Las respuestas del Railway API ya incluyen mensajes conversacionales optimizados para voz
- El agente debe manejar errores gracefully y proporcionar mensajes claros al usuario
- Considera agregar más tools en el futuro (cancelar reserva, modificar reserva, etc.)

