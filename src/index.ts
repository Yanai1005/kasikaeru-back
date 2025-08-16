import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { HonoEnv } from './types/bindings';
import users from './routes/users';
import categories from './routes/categories';
import objects from './routes/objects';
import lentRecords from './routes/lentRecords';

const app = new Hono<HonoEnv>();

// CORS設定
app.use(
  '/api/*',
  cors({
    origin: (origin, c) => {
      const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || [];

      if (allowedOrigins.length === 0) {
        return null;
      }

      if (!origin) {
        return null;
      }

      return allowedOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    credentials: true,
    maxAge: 3600,
  })
);

app.get('/', c => {
  return c.json({
    message: 'Equipment Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      categories: '/api/categories',
      objects: '/api/objects',
      lentRecords: '/api/lent-records',
    },
  });
});

app.route('/api/users', users);
app.route('/api/categories', categories);
app.route('/api/objects', objects);
app.route('/api/lent-records', lentRecords);

app.notFound(c => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint was not found',
    },
    404
  );
});

app.onError((err, c) => {
  console.error('Application error:', err);

  const isProduction = c.env.NODE_ENV === 'production';

  return c.json(
    {
      error: 'Internal Server Error',
      message: isProduction ? 'Something went wrong' : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
    500
  );
});

export default app;
