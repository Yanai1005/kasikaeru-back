import { Hono } from 'hono';
import type { HonoEnv } from '../types/bindings';

const categories = new Hono<HonoEnv>();

// カテゴリ一覧取得
categories.get('/', async c => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM categories ORDER BY category_id'
    ).all();
    return c.json(results);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// カテゴリの備品一覧取得
categories.get('/:id/objects', async c => {
  try {
    const id = c.req.param('id');

    const { results } = await c.env.DB.prepare(
      `
      SELECT o.*, c.category_name 
      FROM objects o 
      JOIN categories c ON o.category_id = c.category_id
      WHERE o.category_id = ?
      ORDER BY o.object_id
    `
    )
      .bind(id)
      .all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching category objects:', error);
    return c.json({ error: 'Failed to fetch category objects' }, 500);
  }
});

export default categories;
