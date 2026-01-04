import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME || '', // Changed from DB_DATABASE to DB_NAME
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use the env variable
    trustServerCertificate: false, // Set to false for Azure
    enableArithAbort: true
  },
  port: 1433
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
  return pool;
}

export { sql };