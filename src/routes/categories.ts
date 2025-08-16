import { Hono } from 'hono';
import type { HonoEnv } from '../types/bindings';

const categories = new Hono<HonoEnv>();

// カテゴリ一覧取得
categories.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare('SELECT * FROM categories ORDER BY category_id').all();
        return c.json(results);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return c.json({ error: 'Failed to fetch categories' }, 500);
    }
});

// カテゴリ作成
categories.post('/', async (c) => {
    try {
        const { category_name } = await c.req.json();

        if (!category_name) {
            return c.json({ error: 'category_name is required' }, 400);
        }

        const result = await c.env.DB.prepare('INSERT INTO categories (category_name) VALUES (?)')
            .bind(category_name)
            .run();

        return c.json({
            message: 'Category created successfully',
            id: result.meta.last_row_id,
            category: { category_id: result.meta.last_row_id, category_name }
        }, 201);
    } catch (error) {
        console.error('Error creating category:', error);
        return c.json({ error: 'Failed to create category' }, 500);
    }
});

// 特定カテゴリ取得
categories.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');

        const { results } = await c.env.DB.prepare('SELECT * FROM categories WHERE category_id = ?')
            .bind(id)
            .all();

        if (results.length === 0) {
            return c.json({ error: 'Category not found' }, 404);
        }

        return c.json(results[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        return c.json({ error: 'Failed to fetch category' }, 500);
    }
});

// カテゴリの備品一覧取得
categories.get('/:id/objects', async (c) => {
    try {
        const id = c.req.param('id');

        const { results } = await c.env.DB.prepare(`
      SELECT o.*, c.category_name 
      FROM objects o 
      JOIN categories c ON o.category_id = c.category_id
      WHERE o.category_id = ?
      ORDER BY o.object_id
    `).bind(id).all();

        return c.json(results);
    } catch (error) {
        console.error('Error fetching category objects:', error);
        return c.json({ error: 'Failed to fetch category objects' }, 500);
    }
});

export default categories;
