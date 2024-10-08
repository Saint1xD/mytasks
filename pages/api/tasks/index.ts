import type { NextApiRequest, NextApiResponse } from 'next';
import getPool from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API request received:', req.method, req.url);

  try {
    const pool = await getPool();
    console.log('Database pool acquired');

    if (req.method === 'GET') {
      try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
        console.log('Tasks fetched:', result.rows.length);
        res.status(200).json(result.rows);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
    } else if (req.method === 'POST') {
      const { title, dueDate, priority } = req.body;
      try {
        const result = await pool.query(
          'INSERT INTO tasks (title, completed, due_date, priority) VALUES ($1, $2, $3, $4) RETURNING *',
          [title, false, dueDate, priority]
        );
        console.log('Task added:', result.rows[0]);
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error('Error adding task:', err);
        res.status(500).json({ error: 'Failed to add task' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error acquiring database pool:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
