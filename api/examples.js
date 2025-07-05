// api/examples.js
import { Pool } from "pg";

/* ─────────  ОДИН pool на все вызовы ───────── */
let pool;

/** лениво создаём, чтобы Vercel держал всего одно подключение */
function getPool() {
  if (!pool) {
    pool = new Pool({
      host:     process.env.PGHOST,      // bdtest353453-palm70289.db-msk0.amvera.tech
      database: process.env.PGDATABASE,  // Bdtest353453
      user:     process.env.PGUSER,      // Bdtest353453_User
      password: process.env.PGPASSWORD,  // Password_74r38647ftyygYUGyugfw673846f7gyrfgu
      port:     process.env.PGPORT,      // 5432
      ssl:      { rejectUnauthorized: false }   // Amvera → SSL без проверки
    });
  }
  return pool;
}

/* ─────────  Vercel handler  ───────── */
export default async function handler(req, res) {
  try {
    const pool = getPool();

    /*  берём последние 20 примеров
        COALESCE → если в схеме ещё нет gif_path, берём старый bot_link  */
    const { rows } = await pool.query(
      `SELECT
           COALESCE(gif_path, bot_link) AS bot_link,
           description
         FROM examples
     ORDER BY id DESC
        LIMIT 20`
    );

    /*  кэш на минуту, чтобы не молотить БД по каждому открытию  */
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.status(200).json(rows);
  } catch (err) {
    console.error("DB error →", err);
    res.status(500).json({ error: "db_error" });
  }
}
