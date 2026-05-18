module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).end();

  try {
    const r = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey:          process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!r.ok) return res.status(401).json({ error: 'invalid_credentials' });

    const { access_token } = await r.json();
    // Devolve apenas o token de acesso — nunca as chaves do Supabase
    res.status(200).json({ token: access_token });
  } catch {
    res.status(500).end();
  }
};
