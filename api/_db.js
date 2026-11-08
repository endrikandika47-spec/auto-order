const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function cmd(...args) {
  if (!URL || !TOKEN) throw new Error('Database belum tersambung (Upstash Redis)');
  const r = await fetch(URL, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, body: JSON.stringify(args) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

exports.get = async (k) => { const v = await cmd('GET', k); return v ? JSON.parse(v) : null; };
exports.set = (k, v) => cmd('SET', k, JSON.stringify(v));
