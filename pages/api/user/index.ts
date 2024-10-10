import type { NextApiRequest, NextApiResponse } from 'next';
import getPool from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const pool = await getPool();
      const result = await pool.query('SELECT id, email, role, avatar_url FROM users');
      const users = result.rows.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url
      }));
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
