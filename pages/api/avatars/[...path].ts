import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: filePath } = req.query;

  if (!filePath || !Array.isArray(filePath) || filePath.length === 0) {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  const avatarPath = path.join(process.cwd(), 'public', 'avatars', ...filePath);

  if (fs.existsSync(avatarPath)) {
    const fileContent = fs.readFileSync(avatarPath);
    const contentType = getContentType(avatarPath);
    res.setHeader('Content-Type', contentType);
    res.status(200).send(fileContent);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}
