import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const transporter = nodemailer.createTransport({
  // Configure your email service here
  host: 'smtp.example.com',
  port: 587,
  auth: {
    user: 'your-email@example.com',
    pass: 'your-password'
  }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      const client = await pool.connect();
      const user = await client.query('SELECT * FROM users WHERE email = $1', [email]);

      if (user.rows.length === 0) {
        client.release();
        return res.status(404).json({ error: 'User not found' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

      await client.query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
        [resetToken, resetTokenExpiry, email]);

      client.release();

      // Send email
      const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
      await transporter.sendMail({
        to: email,
        subject: 'Password Reset',
        html: `Click <a href="${resetUrl}">here</a> to reset your password.`
      });

      res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process password reset' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
