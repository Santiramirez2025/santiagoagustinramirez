// scripts/migrate.js — corre db/schema.sql contra la DB (una sentencia por request, HTTP driver).
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('Falta DATABASE_URL'); process.exit(1); }
  const sql = neon(url);
  const run = (st) => (typeof sql.query === 'function' ? sql.query(st) : sql([st]));

  const raw = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  const cleaned = raw.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
  const stmts = cleaned.split(';').map((s) => s.trim()).filter(Boolean);

  for (const st of stmts) {
    await run(st);
    console.log('ok:', st.slice(0, 46).replace(/\s+/g, ' ') + '…');
  }
  const t = await run(`select table_name from information_schema.tables where table_schema='public' order by 1`);
  const rows = Array.isArray(t) ? t : (t.rows || []);
  console.log('\nTablas en la base:', rows.map((r) => r.table_name).join(', '));
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
