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

  if (req.method === 'GET') {
    try {
      const pool = await getPool()
      const client = await pool.connect()
      const result = await client.query(`
        SELECT ta.*, u.email as user_email
        FROM task_activities ta
        LEFT JOIN users u ON ta.user_id = u.id
        WHERE ta.task_id = $1
        ORDER BY ta.created_at DESC
      `, [id])
      client.release()

      const activities = result.rows.map(row => ({
        id: row.id,
        taskId: row.task_id,
        userId: row.user_id,
        userEmail: row.user_email,
        action: row.action,
        details: row.details,
        createdAt: row.created_at
      }));

      res.status(200).json(activities)
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch task activities' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
