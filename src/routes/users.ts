import { Hono } from 'hono';
import type { HonoEnv } from '../types/bindings';

const users = new Hono<HonoEnv>();

// ユーザー一覧取得
users.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare('SELECT * FROM users').all();
        return c.json(results);
    } catch (error) {
        console.error('Error fetching users:', error);
        return c.json({ error: 'Failed to fetch users' }, 500);
    }
});

export default users;
