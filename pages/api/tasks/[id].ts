import type { NextApiRequest, NextApiResponse } from 'next'
import getPool from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    const { title, description, completed, startDate, dueDate, priority, userId } = req.body
    try {
      const pool = await getPool()
      const client = await pool.connect()

      // Get the original task data
      const originalTask = await client.query('SELECT * FROM tasks WHERE id = $1', [id]);

      // Update the task
      const result = await client.query(
        'UPDATE tasks SET title = $1, description = $2, completed = $3, start_date = $4, due_date = $5, priority = $6, user_id = $7 WHERE id = $8 RETURNING *',
        [title, description, completed, startDate, dueDate, priority, userId, id]
      )

      if (result.rows.length > 0) {
        const updatedTask = result.rows[0];

        // Record the activity
        const changes = compareChanges(originalTask.rows[0], updatedTask);
        if (Object.keys(changes).length > 0) {
          try {
            await client.query(
              'INSERT INTO task_activities (task_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
              [id, user.userId, 'update', JSON.stringify(changes)]
            );
          } catch (activityError) {
            console.error('Failed to record task activity:', activityError);
            // Continue with the response even if activity recording fails
          }
        }

        client.release()
        res.status(200).json({
          ...updatedTask,
          startDate: updatedTask.start_date,
          dueDate: updatedTask.due_date,
          userId: updatedTask.user_id
        });
      } else {
        client.release()
        res.status(404).json({ error: 'Task not found' })
      }
    } catch (err) {
      console.error(err);
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

function compareChanges(original: any, updated: any) {
  const changes: Record<string, { from: any, to: any }> = {};
  for (const key in updated) {
    if (original[key] !== updated[key]) {
      changes[key] = { from: original[key], to: updated[key] };
    }
  }
  return changes;
}
