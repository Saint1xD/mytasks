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
        const tasks = result.rows.map(task => ({
          ...task,
          startDate: task.start_date,
          dueDate: task.due_date,
          userId: task.user_id
        }));
        res.status(200).json(tasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
    } else if (req.method === 'POST') {
      const { title, description, startDate, dueDate, priority, userId } = req.body;
      try {
        const result = await pool.query(
          'INSERT INTO tasks (title, description, completed, start_date, due_date, priority, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [title, description, false, startDate, dueDate, priority, userId]
        );
        console.log('Task added:', result.rows[0]);
        const newTask = {
          ...result.rows[0],
          startDate: result.rows[0].start_date,
          dueDate: result.rows[0].due_date,
          userId: result.rows[0].user_id
        };
        res.status(201).json(newTask);
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
