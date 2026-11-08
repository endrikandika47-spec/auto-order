const db = require('./_db');
const { check } = require('./_auth');

module.exports = async (req, res) => {
  try {
    const list = (await db.get('products')) || [];
    if (req.method === 'GET') return res.json(check(req) ? list : list.filter((p) => p.active));
    if (req.method === 'PUT') {
      if (!check(req)) return res.status(401).json({ error: 'Sesi habis, login lagi' });
      const clean = (req.body.products || []).map((p) => ({
        id: String(p.id).replace(/\W/g, ''),
        name: String(p.name || '').slice(0, 100),
        price: Math.max(0, Math.round(+p.price || 0)),
        desc: String(p.desc || '').slice(0, 300),
        active: p.active !== false,
      }));
      await db.set('products', clean);
      return res.json({ ok: true });
    }
    res.status(405).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
};
