# The Well-Kept Habitat — Launch Event Website

Static, mobile-first landing page for `launch.wellkepthabitat.com`, designed for guests arriving from the Rise & Shine Social QR code.

## Included

- Responsive launch landing page
- RSVP form
- Separate email-marketing opt-in
- Interest segmentation for future TWKH contacts
- Newsletter-only signup form
- Cloudflare Pages Functions for form handling
- Cloudflare D1 schema for RSVP/contact storage
- `noindex` / `robots.txt` protection so the invitation address is not intended for search indexing
- TWKH logo assets extracted from the current logo kit

## Event details currently coded

- Rise & Shine Social
- Hosted by Shekeyla (SC) Sandore
- Saturday, August 29, 2026
- 9:00 a.m. (no end time)
- 45 Viscount, Longmeadow, MA
- Tagline: “Elegant landscapes curated for biodiversity.”

## Deploy on Cloudflare Pages

### 1. Put this folder in the GitHub repository connected to the launch Pages project

The site is plain HTML/CSS/JS. The `functions/` directory is recognized by Cloudflare Pages Functions.

### 2. Create a D1 database

Example with Wrangler:

```bash
npx wrangler d1 create twkh-launch
```

Then load the schema:

```bash
npx wrangler d1 execute twkh-launch --remote --file=./schema.sql
```

### 3. Bind the D1 database to the Pages project

In Cloudflare:

`Workers & Pages → launch project → Settings → Bindings → Add → D1 database`

Use this variable name exactly:

`TWKH_DB`

Select the D1 database created above, save, then redeploy the Pages project.

### 4. Connect the custom subdomain

Attach:

`launch.wellkepthabitat.com`

as the custom domain for the Pages project.

## Where the submissions go

- Event RSVPs → `rsvps` table
- Newsletter subscribers → `subscribers` table
- RSVP guests who check the email opt-in are also added to `subscribers`

The RSVP table intentionally stores the opt-in separately from event attendance.

## Important before publishing

1. Test an RSVP with `Yes`, `No`, and `Maybe`.
2. Confirm the D1 rows appear.
3. Test the newsletter signup.
4. Test the QR code on both iPhone and Android.
5. Confirm `launch.wellkepthabitat.com` loads over HTTPS.
6. Re-export the logo assets later if the logo kit changes; the HTML references only two PNGs in `/assets`, so replacement is simple.

## Main files

- `index.html` — page content and form
- `styles.css` — visual system and responsive layout
- `script.js` — form interaction/submission
- `functions/api/rsvp.js` — RSVP endpoint
- `functions/api/subscribe.js` — newsletter endpoint
- `schema.sql` — D1 tables
- `privacy.html` — concise privacy notice
