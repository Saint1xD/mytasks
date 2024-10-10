require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const createPool = () => {
  console.log('Creating new database pool');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
};

const getPool = async () => {
  const pool = createPool();
  try {
    console.log('Testing database connection');
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    return pool;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error;
  }
};

const cleanupAvatars = async () => {
  try {
    const pool = await getPool();
    const client = await pool.connect();

    // Get all avatar URLs from the database
    const result = await client.query('SELECT avatar_url FROM users WHERE avatar_url IS NOT NULL');
    const usedAvatars = new Set(result.rows.map(row => row.avatar_url.split('/').pop()));

    // Get all files in the avatars directory
    const avatarDir = path.join(process.cwd(), 'public', 'avatars');
    const files = await fs.readdir(avatarDir);

    // Delete files that are not in the database
    let deletedCount = 0;
    for (const file of files) {
      if (!usedAvatars.has(file)) {
        await fs.unlink(path.join(avatarDir, file));
        deletedCount++;
      }
    }

    client.release();
    await pool.end();

    console.log(`Cleaned up ${deletedCount} unused avatar files`);
  } catch (error) {
    console.error('Error cleaning up avatars:', error);
  }
};

cleanupAvatars();
