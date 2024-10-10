import type { NextApiRequest, NextApiResponse } from 'next';
import getPool from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = await getPool();
    const client = await pool.connect();

    // Get all avatar URLs from the database
    const result = await client.query('SELECT avatar_url FROM users WHERE avatar_url IS NOT NULL');
    const usedAvatars = new Set(result.rows.map(row => row.avatar_url.replace(/^\//, '')));

    // Get all files in the avatars directory
    const avatarDir = path.join(process.cwd(), 'public', 'avatars');
    const files = await fs.readdir(avatarDir);

    // Delete files that are not in the database
    let deletedCount = 0;
    for (const file of files) {
      if (!usedAvatars.has(`avatars/${file}`)) {
        await fs.unlink(path.join(avatarDir, file));
        deletedCount++;
      }
    }

    client.release();

    res.status(200).json({ message: `Cleaned up ${deletedCount} unused avatar files` });
  } catch (error) {
    console.error('Error cleaning up avatars:', error);
    res.status(500).json({ error: 'An error occurred while cleaning up avatars' });
  }
}
