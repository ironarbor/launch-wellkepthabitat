const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (clean(body.company, 200)) return Response.json({ ok: true });

    const email = clean(body.email, 160).toLowerCase();
    const source = clean(body.source, 60) || 'launch-site';
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    const db = context.env.TWKH_DB;
    if (!db) {
      return Response.json({ error: 'Signup storage is not configured yet.' }, { status: 503 });
    }

    const now = new Date().toISOString();
    await db.prepare(`
      INSERT INTO subscribers (created_at, updated_at, email, source)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        updated_at = excluded.updated_at,
        source = excluded.source
    `).bind(now, now, email, source).run();

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: 'Unable to join the list right now.' }, { status: 500 });
  }
}
