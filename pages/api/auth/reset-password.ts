import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import getPool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const pool = await getPool();
    const client = await pool.connect();

    // Verify current password
    const result = await client.query('SELECT password FROM users WHERE id = $1', [user.userId]);
    const dbUser = result.rows[0];

    if (!dbUser || !bcrypt.compareSync(currentPassword, dbUser.password)) {
      client.release();
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.userId]);

    client.release();
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'An error occurred while resetting the password' });
  }
}
