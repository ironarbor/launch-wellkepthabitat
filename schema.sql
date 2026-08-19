CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  attending TEXT NOT NULL CHECK (attending IN ('yes', 'no', 'maybe')),
  party_size INTEGER NOT NULL DEFAULT 1,
  guest_names TEXT NOT NULL DEFAULT '',
  bringing_children TEXT NOT NULL DEFAULT '',
  dietary_notes TEXT NOT NULL DEFAULT '',
  email_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (email_opt_in IN (0, 1)),
  interests TEXT NOT NULL DEFAULT '[]',
  source TEXT NOT NULL DEFAULT 'launch-qr'
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  source TEXT NOT NULL DEFAULT 'launch-site'
);

CREATE INDEX IF NOT EXISTS idx_rsvps_attending ON rsvps(attending);
CREATE INDEX IF NOT EXISTS idx_rsvps_updated_at ON rsvps(updated_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_updated_at ON subscribers(updated_at);
