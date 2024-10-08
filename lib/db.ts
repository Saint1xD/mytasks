import { Pool } from 'pg';

const createPool = (): Pool => {
  console.log('Creating new database pool');
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
};

let pool: Pool | null = null;

const getPool = async (): Promise<Pool> => {
  if (!pool) {
    pool = createPool();
  }

  try {
    console.log('Testing database connection');
    await pool.query('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    console.log('Retrying in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    pool = createPool();
    return getPool();
  }

  return pool;
};

export default getPool;
