import type { NextApiRequest, NextApiResponse } from 'next';
import getPool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email } = req.body;

  try {
    const pool = await getPool();
    const client = await pool.connect();

    // Check if email is already in use
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, user.userId]);
    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Update email
    const result = await client.query(
      'UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email, role, avatar_url',
      [email, user.userId]
    );
    client.release();

    const updatedUser = result.rows[0];
    res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatar_url
    });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ error: 'An error occurred while updating the email' });
  }
}
