Smoke test scripts

Run a quick smoke test for guest-facing flows (requires Node >= 18 and network access):

1) Build & preview the site:

```powershell
npm run build
npm run preview
```

2) Open the public guest invite in your browser (replace `<slug>`):

- Guest URL: `http://localhost:4173/?invite=<slug>`

3) Run the backend smoke script which directly talks to Supabase (verifies writes):

```powershell
node --experimental-top-level-await scripts/smoke_test_guest.mjs
```

The script will pick an existing invitation slug from the project's Supabase DB, insert an RSVP, a public comment, and a private message, then read them back and print results.

If anything fails, paste the script output here and I'll debug further.
