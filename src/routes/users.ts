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

// ユーザー作成
users.post('/', async (c) => {
    try {
        const { discord_id, name } = await c.req.json();

        if (!discord_id || !name) {
            return c.json({ error: 'discord_id and name are required' }, 400);
        }

        const result = await c.env.DB.prepare('INSERT INTO users (discord_id, name) VALUES (?, ?)')
            .bind(discord_id, name)
            .run();

        return c.json({
            message: 'User created successfully',
            user: { discord_id, name }
        }, 201);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'User with this Discord ID already exists' }, 409);
        }
        return c.json({ error: 'Failed to create user' }, 500);
    }
});

// 特定ユーザー取得
users.get('/:discord_id', async (c) => {
    try {
        const discord_id = c.req.param('discord_id');

        const { results } = await c.env.DB.prepare('SELECT * FROM users WHERE discord_id = ?')
            .bind(discord_id)
            .all();

        if (results.length === 0) {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json(results[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        return c.json({ error: 'Failed to fetch user' }, 500);
    }
});

export default users;
