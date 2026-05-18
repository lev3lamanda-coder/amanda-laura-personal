const ALLOWED_TYPES  = new Set(['pageview', 'planview', 'click']);
const ALLOWED_CLICKS = new Set([
  'CTA Hero', 'Plano Trimestral', 'Plano Semestral', 'Plano Anual', 'Ver Planos',
]);

// Data no fuso de Brasília (UTC-3) — meia-noite BRT = 03:00 UTC
function brazilDate() {
  return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

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
        date: brazilDate(),   // sempre data BRT — reset à meia-noite de Brasília
      }),
    });
    res.status(r.ok ? 200 : 502).end();
  } catch {
    res.status(500).end();
  }
};
