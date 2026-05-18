module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Dados inválidos. Senha mínima 6 caracteres.' });
  }

  try {
    // Cria usuário via Supabase Admin API — email já confirmado, sem envio de e-mail
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey:          process.env.SUPABASE_SERVICE_KEY,
        Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
      }),
    });

    const json = await r.json();

    if (!r.ok) {
      const msg = json?.msg || json?.message || 'Erro ao criar usuário.';
      return res.status(400).json({ error: msg });
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
};
