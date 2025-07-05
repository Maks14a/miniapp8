// api/examples.js
import { Pool } from 'pg';

/* —-—- Пул к базе —-—- */
const pool = new Pool({
  host:     process.env.PGHOST,
  database: process.env.PGDATABASE,
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port:     process.env.PGPORT,
  ssl:      { rejectUnauthorized: false }    // Amvera требует SSL, но без проверки
});

/* —-—- Экспорт обработчика Vercel —-—- */
export default async function handler(req, res) {
  try {
    /* берём последние 20 примеров */
    const { rows } = await pool.query(
      'SELECT gif_path AS bot_link, description FROM examples ORDER BY id DESC LIMIT 20'
    );

    /* Отдаём JSON Mini App’у  */
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(rows);
  } catch (err) {
    console.error('DB error →', err);
    return res.status(500).json({ error: 'db_error' });
  }
}
