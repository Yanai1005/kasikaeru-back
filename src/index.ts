import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { HonoEnv } from './types/bindings';
import users from './routes/users';
import categories from './routes/categories';
import objects from './routes/objects';
import lentRecords from './routes/lentRecords';

const app = new Hono<HonoEnv>();

app.use('/api/*', cors());

app.route('/api/users', users);
app.route('/api/categories', categories);
app.route('/api/objects', objects);
app.route('/api/lent-records', lentRecords);

export default app;
