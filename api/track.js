const ALLOWED_TYPES  = new Set(['pageview', 'planview', 'click']);
const ALLOWED_CLICKS = new Set([
  'CTA Hero', 'Plano Trimestral', 'Plano Semestral', 'Plano Anual', 'Ver Planos',
]);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { session_id, event_type, event_name } = req.body || {};

  if (
    typeof session_id !== 'string' || session_id.length < 10 ||
    !ALLOWED_TYPES.has(event_type) ||
    (event_type === 'click' && !ALLOWED_CLICKS.has(event_name))
  ) {
    return res.status(400).end();
  }

  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        apikey:          process.env.SUPABASE_SERVICE_KEY,
        Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer:         'return=minimal',
      },
      body: JSON.stringify({
        session_id,
        event_type,
        event_name: event_name || null,
      }),
    });
    res.status(r.ok ? 200 : 502).end();
  } catch {
    res.status(500).end();
  }
};
