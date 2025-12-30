import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import schedulesRouter from './routes/schedules.js';
import reservationsRouter from './routes/reservations.js';

const app = express();

// ============================================
// Middlewares Globales
// ============================================

// CORS - Permitir requests desde cualquier origen
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (solo en desarrollo)
if (!config.server.isProduction) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Rutas Públicas
// ============================================

app.use(healthRouter);

// ============================================
// Rutas Protegidas (requieren autenticación)
// ============================================

const apiRouter = express.Router();
apiRouter.use(authMiddleware); // Todas las rutas bajo /api requieren auth

apiRouter.use(schedulesRouter);
apiRouter.use(reservationsRouter);

app.use('/api', apiRouter);

// ============================================
// Manejo de Errores
// ============================================

app.use(errorHandler);

// ============================================
// Iniciar Servidor
// ============================================

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`
🚀 Lumen Resto API Server iniciado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Puerto: ${PORT}
🌍 Entorno: ${config.server.nodeEnv}
🔗 Health Check: http://localhost:${PORT}/health
📚 Endpoints:
   POST /api/check-schedule
   POST /api/create-reservation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Manejo graceful de shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

