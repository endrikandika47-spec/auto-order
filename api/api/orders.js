const db = require('./_db');
const { check } = require('./_auth');
const STATUS = ['pending', 'dibayar', 'diproses', 'selesai', 'batal'];

module.exports = async (req, res) => {
  try {
    const orders = (await db.get('orders')) || [];
    const b = req.body || {};

    if (req.method === 'POST') {
      const p = ((await db.get('products')) || []).find((x) => x.id === b.productId && x.active);
      const qty = Math.min(999, Math.max(1, Math.round(+b.qty || 1)));
      if (!p || !String(b.name || '').trim() || !String(b.wa || '').trim())
        return res.status(400).json({ error: 'Data pesanan belum lengkap' });
      const o = {
        id: 'ORD' + Date.now().toString(36).toUpperCase(),
        name: String(b.name).slice(0, 80), wa: String(b.wa).slice(0, 20),
        productId: p.id, product: p.name, qty, total: p.price * qty,
        note: String(b.note || '').slice(0, 300), status: 'pending', createdAt: Date.now(),
      };
      orders.unshift(o);
      await db.set('orders', orders);
      return res.json({ id: o.id, total: o.total });
    }

    if (req.method === 'GET' && req.query.id) {
      const o = orders.find((x) => x.id === String(req.query.id).toUpperCase());
      return o ? res.json({ status: o.status, product: o.product }) : res.status(404).json({ error: 'Kode pesanan tidak ditemukan' });
    }

    if (!check(req)) return res.status(401).json({ error: 'Sesi habis, login lagi' });

    if (req.method === 'GET') return res.json(orders);
    if (req.method === 'PATCH') {
      const o = orders.find((x) => x.id === b.id);
      if (!o || !STATUS.includes(b.status)) return res.status(400).json({ error: 'Data tidak valid' });
      o.status = b.status;
      await db.set('orders', orders);
      return res.json({ ok: true });
    }
    if (req.method === 'DELETE') {
      await db.set('orders', orders.filter((x) => x.id !== req.query.id));
      return res.json({ ok: true });
    }
    res.status(405).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
};
