import type { NextApiRequest, NextApiResponse } from 'next';
import getPool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { IncomingForm, File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'avatars');

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`Upload directory created/verified: ${uploadDir}`);
  } catch (err) {
    console.error('Error creating upload directory:', err);
    return res.status(500).json({ error: 'Error creating upload directory' });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error uploading file' });
    }

    console.log('Files received:', files);

    const avatarFiles = files.avatar as File[];
    if (!avatarFiles || avatarFiles.length === 0) {
      console.error('No file received');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = avatarFiles[0];
    console.log('File details:', file);

    const oldPath = file.filepath;
    const fileName = `${user.userId}-${Date.now()}${path.extname(file.originalFilename || '')}`;
    const newPath = path.join(uploadDir, fileName);

    try {
      await fs.rename(oldPath, newPath);
      console.log(`File moved from ${oldPath} to ${newPath}`);

      const pool = await getPool();
      const client = await pool.connect();

      // Delete old avatar if exists
      const oldAvatarResult = await client.query('SELECT avatar_url FROM users WHERE id = $1', [user.userId]);
      const oldAvatarUrl = oldAvatarResult.rows[0]?.avatar_url;
      if (oldAvatarUrl) {
        const oldAvatarPath = path.join(process.cwd(), 'public', oldAvatarUrl);
        try {
          await fs.unlink(oldAvatarPath);
          console.log(`Old avatar deleted: ${oldAvatarPath}`);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
        }
      }

      const avatarUrl = `/avatars/${fileName}`;
      await client.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, user.userId]);

      client.release();

      console.log(`Avatar URL updated in database: ${avatarUrl}`);
      res.status(200).json({ avatarUrl });
    } catch (error) {
      console.error('Error updating avatar:', error);
      res.status(500).json({ error: 'An error occurred while updating the avatar' });
    }
  });
}
