// api/examples.js
import { Pool } from "pg";

/* ─────────  ОДИН pool на все вызовы ───────── */
let pool;

/** лениво создаём, чтобы Vercel не открывал 1 соединение на каждый вызов */
function getPool() {
  if (!pool) {
    pool = new Pool({
      host:     process.env.PGHOST,      // 
      database: process.env.PGDATABASE,  // 
      user:     process.env.PGUSER,      // 
      password: process.env.PGPASSWORD,  // 
      port:     process.env.PGPORT,      // 
      ssl:      { rejectUnauthorized: false }  // 🔑 SSL без проверки
    });
  }
  return pool;
}

/* ─────────  Vercel handler  ───────── */
export default async function handler(req, res) {
  try {
    const pool = getPool();

    // берём последние 20 примеров
    const { rows } = await pool.query(
      `SELECT gif_path AS bot_link, description
         FROM examples
     ORDER BY id DESC
        LIMIT 20`
    );

    // кэш на 1 мин; Mini-App подхватит JSON
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.status(200).json(rows);
  } catch (err) {
    console.error("DB error →", err);
    res.status(500).json({ error: "db_error" });
  }
}
