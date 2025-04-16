import mysql from 'mysql2';

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'bizprospex',
  password: 'unknownuse@2024' ,
  port: 3306,
  connectTimeout: 150000,
});

export default pool.promise();
