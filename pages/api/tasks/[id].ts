import type { NextApiRequest, NextApiResponse } from 'next'
import getPool from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method === 'PUT') {
    const { title, description, completed, startDate, dueDate, priority, userId } = req.body
    try {
      const pool = await getPool()
      const client = await pool.connect()
      const result = await client.query(
        'UPDATE tasks SET title = $1, description = $2, completed = $3, start_date = $4, due_date = $5, priority = $6, user_id = $7 WHERE id = $8 RETURNING *',
        [title, description, completed, startDate, dueDate, priority, userId, id]
      )
      client.release()
      if (result.rows.length > 0) {
        const updatedTask = {
          ...result.rows[0],
          startDate: result.rows[0].start_date,
          dueDate: result.rows[0].due_date,
          userId: result.rows[0].user_id
        };
        res.status(200).json(updatedTask);
      } else {
        res.status(404).json({ error: 'Task not found' })
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update task' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const pool = await getPool()
      const client = await pool.connect()
      const result = await client.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id])
      client.release()
      if (result.rows.length > 0) {
        res.status(200).json({ message: 'Task deleted successfully' })
      } else {
        res.status(404).json({ error: 'Task not found' })
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete task' })
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
