const crypto = require('crypto');
const key = () => process.env.ADMIN_PASSWORD || '';
const mac = (s) => crypto.createHmac('sha256', key()).update(s).digest('hex');

exports.sign = () => { const exp = String(Date.now() + 864e5); return exp + '.' + mac(exp); };

exports.check = (req) => {
  if (!key()) return false;
  const [exp, sig] = (req.headers.authorization || '').replace('Bearer ', '').split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  const ok = mac(exp);
  return sig.length === ok.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(ok));
};
