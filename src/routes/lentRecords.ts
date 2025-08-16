import { Hono } from 'hono';
import type { HonoEnv } from '../types/bindings';

const lentRecords = new Hono<HonoEnv>();

// 貸出記録一覧取得
lentRecords.get('/', async c => {
  try {
    const status = c.req.query('status');

    let query = `
      SELECT 
        lr.*,
        u.name as user_name,
        o.object_name,
        o.code_value,
        c.category_name
      FROM lent_records lr
      JOIN users u ON lr.discord_id = u.discord_id
      JOIN objects o ON lr.object_id = o.object_id
      JOIN categories c ON o.category_id = c.category_id
    `;

    if (status === 'active') {
      query += ' WHERE lr.lent_state = true';
    } else if (status === 'returned') {
      query += ' WHERE lr.lent_state = false';
    }

    query += ' ORDER BY lr.lent_date DESC';

    const { results } = await c.env.DB.prepare(query).all();
    return c.json(results);
  } catch (error) {
    console.error('Error fetching lent records:', error);
    return c.json({ error: 'Failed to fetch lent records' }, 500);
  }
});

// 貸出処理
lentRecords.post('/', async c => {
  try {
    const { lent_id, object_id, discord_id } = await c.req.json();

    if (!lent_id || !object_id || !discord_id) {
      return c.json(
        { error: 'lent_id, object_id, and discord_id are required' },
        400
      );
    }

    // 備品が存在し、かつ貸出中でないことを確認
    const { results: existingLent } = await c.env.DB.prepare(
      `
      SELECT id FROM lent_records 
      WHERE object_id = ? AND lent_state = true
    `
    )
      .bind(object_id)
      .all();

    if (existingLent.length > 0) {
      return c.json({ error: 'Object is already lent out' }, 400);
    }

    const result = await c.env.DB.prepare(
      `
      INSERT INTO lent_records (lent_id, object_id, discord_id, lent_state) 
      VALUES (?, ?, ?, true)
    `
    )
      .bind(lent_id, object_id, discord_id)
      .run();

    return c.json(
      {
        message: 'Item lent successfully',
        id: result.meta.last_row_id,
        lent_record: {
          id: result.meta.last_row_id,
          lent_id,
          object_id,
          discord_id,
          lent_state: true,
        },
      },
      201
    );
  } catch (error) {
    console.error('Error creating lent record:', error);
    return c.json({ error: 'Failed to create lent record' }, 500);
  }
});

// 返却処理
lentRecords.put('/:id/return', async c => {
  try {
    const id = c.req.param('id');

    const result = await c.env.DB.prepare(
      `
      UPDATE lent_records 
      SET lent_state = false 
      WHERE id = ? AND lent_state = true
    `
    )
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return c.json(
        { error: 'Lent record not found or already returned' },
        404
      );
    }

    return c.json({ message: 'Item returned successfully' });
  } catch (error) {
    console.error('Error returning item:', error);
    return c.json({ error: 'Failed to return item' }, 500);
  }
});

export default lentRecords;
