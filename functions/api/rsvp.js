const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ATTENDING = new Set(['yes', 'no', 'maybe']);

function clean(value, max = 240) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function onRequestPost(context) {
  try {
    const request = context.request;
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return Response.json({ error: 'Invalid request.' }, { status: 415 });
    }

    const body = await request.json();
    if (clean(body.website, 200)) {
      return Response.json({ ok: true });
    }

    const firstName = clean(body.firstName, 60);
    const lastName = clean(body.lastName, 60);
    const email = clean(body.email, 160).toLowerCase();
    const attending = clean(body.attending, 10);
    const partySize = attending === 'no' ? 0 : Math.min(Math.max(Number(body.partySize) || 1, 1), 8);
    const guestNames = clean(body.guestNames, 240);
    const children = clean(body.children, 10);
    const dietaryNotes = clean(body.dietaryNotes, 240);
    const emailOptIn = body.emailOptIn === true ? 1 : 0;
    const source = clean(body.source, 60) || 'launch-qr';
    const interests = Array.isArray(body.interests)
      ? body.interests.slice(0, 20).map((item) => clean(item, 80)).filter(Boolean)
      : [];

    if (!firstName || !lastName || !EMAIL_RE.test(email) || !ATTENDING.has(attending)) {
      return Response.json({ error: 'Please complete the required RSVP fields.' }, { status: 400 });
    }

    const db = context.env.TWKH_DB;
    if (!db) {
      return Response.json({ error: 'RSVP storage is not configured yet.' }, { status: 503 });
    }

    const now = new Date().toISOString();
    const rsvp = db.prepare(`
      INSERT INTO rsvps (
        created_at, updated_at, first_name, last_name, email, attending,
        party_size, guest_names, bringing_children, dietary_notes,
        email_opt_in, interests, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        updated_at = excluded.updated_at,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        attending = excluded.attending,
        party_size = excluded.party_size,
        guest_names = excluded.guest_names,
        bringing_children = excluded.bringing_children,
        dietary_notes = excluded.dietary_notes,
        email_opt_in = excluded.email_opt_in,
        interests = excluded.interests,
        source = excluded.source
    `).bind(
      now, now, firstName, lastName, email, attending,
      partySize, guestNames, children, dietaryNotes,
      emailOptIn, JSON.stringify(interests), source
    );

    await rsvp.run();

    if (emailOptIn) {
      await db.prepare(`
        INSERT INTO subscribers (created_at, updated_at, email, source)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          updated_at = excluded.updated_at,
          source = excluded.source
      `).bind(now, now, email, 'rsvp-opt-in').run();
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: 'Unable to save the RSVP right now.' }, { status: 500 });
  }
}
