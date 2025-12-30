# Lumen Resto Platform

Plataforma completa de reservas para Lumen Resto que integra:
- **Railway REST API**: Backend central con endpoints públicos
- **MCP Server**: Servidor local para integración con Cursor IDE
- **ElevenLabs Integration**: Agente de voz conversacional

## 🏗️ Arquitectura

```
┌─────────────────┐     STDIO      ┌──────────────────┐
│   Cursor IDE    │ ◄────────────► │  MCP Server      │
│   (Local)       │                │  (Local)         │
└─────────────────┘                └────────┬─────────┘
                                            │ HTTP
                                            ▼
                                    ┌───────────────┐
                                    │ Railway API   │
                                    │ (Cloud)       │
                                    └───────┬───────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
            ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
            │  ElevenLabs  │      │   Supabase   │      │   Monitoring │
            │  Agent       │      │  PostgreSQL  │      │              │
            └──────────────┘      └──────────────┘      └──────────────┘
```

## 📦 Estructura del Proyecto

```
lumen-resto-platform/
├── rest-api/              # Railway REST API (Backend Central)
│   ├── src/
│   │   ├── config/        # Configuración (env, supabase)
│   │   ├── middleware/    # Auth, error handling, validation
│   │   ├── routes/        # Endpoints REST
│   │   ├── services/      # Lógica de negocio
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── mcp-server/            # MCP Server para Cursor
│   ├── src/
│   │   ├── tools/         # Tools MCP (check-schedule, create-reservation)
│   │   ├── api-client.ts  # Cliente para Railway API
│   │   ├── config.ts      # Configuración local
│   │   └── index.ts       # Servidor MCP STDIO
│   └── package.json
│
└── package.json           # Workspace root
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+
- npm 10+
- Cuenta de Railway
- Cuenta de Supabase
- Cuenta de ElevenLabs (para integración de voz)

### Setup Local

1. **Clonar e instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
# Copiar .env.example a cada workspace
cp .env.example rest-api/.env
cp .env.example mcp-server/.env

# Editar y completar con tus credenciales
```

3. **Desarrollar localmente:**
```bash
# Terminal 1: Railway API
npm run dev:api

# Terminal 2: MCP Server (si lo necesitas para Cursor)
npm run dev:mcp
```

### Deploy en Railway

1. Crear proyecto en Railway
2. Conectar repositorio GitHub (o subir código)
3. Configurar variables de entorno en Railway Dashboard
4. Railway auto-detecta y despliega

## 📚 Documentación Detallada

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía paso a paso para deploy completo
- **[ELEVENLABS_SETUP.md](ELEVENLABS_SETUP.md)** - Guía completa de integración con ElevenLabs
- [rest-api/README.md](rest-api/README.md) - Railway API (endpoints y uso)
- [mcp-server/README.md](mcp-server/README.md) - MCP Server (configuración para Cursor)

## 🔐 Seguridad

- ✅ Variables de entorno para credenciales
- ✅ Autenticación con API Key
- ✅ Validación de inputs con Zod
- ✅ Queries parametrizadas (prevención SQL injection)
- ✅ Rate limiting (por implementar)

## 📝 Licencia

MIT

