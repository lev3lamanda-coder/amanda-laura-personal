module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  // 1. Extrai token do header Authorization
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).end();

  try {
    // 2. Verifica se o token é válido chamando Supabase /auth/v1/user
    const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!userRes.ok) return res.status(401).end();

    // 3. Busca dados de analytics usando a service key (bypass RLS — seguro, server-side)
    const since = /^\d{4}-\d{2}-\d{2}$/.test(req.query.since)
      ? req.query.since
      : new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

    const dataRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/analytics_events` +
      `?select=session_id,event_type,event_name,date` +
      `&date=gte.${since}` +
      `&order=created_at.asc` +
      `&limit=100000`,
      {
        headers: {
          apikey:        process.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    const data = await dataRes.json();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data);
  } catch {
    res.status(500).end();
  }
};
