import type { NextApiRequest, NextApiResponse } from 'next';
import getPool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const pool = await getPool();
    const client = await pool.connect();

    const result = await client.query(
      'SELECT id, email, role, avatar_url FROM users WHERE id = $1',
      [user.userId]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = result.rows[0];
    res.status(200).json({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      avatarUrl: userData.avatar_url
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
}
