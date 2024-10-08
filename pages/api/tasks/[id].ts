import type { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method === 'PUT') {
    const { title, completed, startDate, dueDate, priority } = req.body
    try {
      const client = await pool.connect()
      const result = await client.query(
        'UPDATE tasks SET title = $1, completed = $2, start_date = $3, due_date = $4, priority = $5 WHERE id = $6 RETURNING *',
        [title, completed, startDate, dueDate, priority, id]
      )
      client.release()
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0])
      } else {
        res.status(404).json({ error: 'Task not found' })
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update task' })
    }
  } else if (req.method === 'DELETE') {
    try {
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
