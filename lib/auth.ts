import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

export async function verifyToken(req: NextApiRequest) {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Received token:', token);

  if (!token) {
    console.log('No token provided');
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('Token decoded:', decoded);
    return decoded as { userId: number; email: string; role: string };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
