const { sign } = require('./_auth');

module.exports = (req, res) => {
  const pw = process.env.ADMIN_PASSWORD;
  if (req.method !== 'POST' || !pw || (req.body || {}).password !== pw)
    return res.status(401).json({ error: 'Password salah' });
  res.json({ token: sign() });
};
