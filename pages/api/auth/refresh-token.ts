import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { verifyToken } from '@/lib/auth';
import getPool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const pool = await getPool();
    const client = await pool.connect();

    const result = await client.query('SELECT * FROM users WHERE id = $1', [user.userId]);
    const dbUser = result.rows[0];

    client.release();

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      { userId: dbUser.id, email: dbUser.email, role: dbUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        avatarUrl: dbUser.avatar_url
      }
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'An error occurred while refreshing the token' });
  }
}
