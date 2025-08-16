import { Hono } from 'hono';
import type { HonoEnv } from '../types/bindings';

const objects = new Hono<HonoEnv>();

// 備品一覧取得
objects.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare(`
      SELECT o.*, c.category_name 
      FROM objects o 
      JOIN categories c ON o.category_id = c.category_id
      ORDER BY o.object_id
    `).all();
        return c.json(results);
    } catch (error) {
        console.error('Error fetching objects:', error);
        return c.json({ error: 'Failed to fetch objects' }, 500);
    }
});

// 備品作成
objects.post('/', async (c) => {
    try {
        const { code_value, object_name, category_id } = await c.req.json();

        if (!code_value || !object_name || !category_id) {
            return c.json({ error: 'code_value, object_name, and category_id are required' }, 400);
        }

        const result = await c.env.DB.prepare(`
      INSERT INTO objects (code_value, object_name, category_id) 
      VALUES (?, ?, ?)
    `).bind(code_value, object_name, category_id).run();

        return c.json({
            message: 'Object created successfully',
            id: result.meta.last_row_id,
            object: { object_id: result.meta.last_row_id, code_value, object_name, category_id }
        }, 201);
    } catch (error) {
        console.error('Error creating object:', error);
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Object with this code already exists' }, 409);
        }
        return c.json({ error: 'Failed to create object' }, 500);
    }
});

// バーコードで備品検索
objects.get('/by-code/:code', async (c) => {
    try {
        const code = c.req.param('code');

        const { results } = await c.env.DB.prepare(`
      SELECT o.*, c.category_name,
        CASE WHEN lr.object_id IS NOT NULL THEN true ELSE false END as is_lent,
        lr.lent_id,
        lr.lent_date,
        u.name as lent_to_user
      FROM objects o 
      JOIN categories c ON o.category_id = c.category_id
      LEFT JOIN lent_records lr ON o.object_id = lr.object_id AND lr.lent_state = true
      LEFT JOIN users u ON lr.discord_id = u.discord_id
      WHERE o.code_value = ?
    `).bind(code).all();

        if (results.length === 0) {
            return c.json({ error: 'Object not found' }, 404);
        }

        return c.json(results[0]);
    } catch (error) {
        console.error('Error finding object by code:', error);
        return c.json({ error: 'Failed to find object' }, 500);
    }
});

export default objects;
