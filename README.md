# Ironclad-Sites Landing Page (Mockup)

This is a **simple, modern, mobile-friendly landing page mockup** for Ironclad-Sites with:
- Strong headline + short service description
- Section explicitly mentioning **contractors** and **real estate agents**
- Clear CTAs (“Book a Call” / “Get Started”)
- Interactive lead form (validation + success toast + copy-to-clipboard)
- No pricing

## Files
- `index.html`
- `styles.css`
- `script.js`
- `assets/favicon.svg`

## Run locally (Windows)

### Option A: Use VS Code/Cursor “Live Server”
If you have the Live Server extension, open `index.html` and click **Go Live**.

### Option B: Python simple server
From the project folder:

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Make it live for free

### Option 1 (recommended): Cloudflare Pages (free)
1. Create a GitHub repo and push this folder (or upload the files).
2. In Cloudflare Pages, **Create a project** and connect the repo.
3. Build settings:
   - Framework preset: **None**
   - Build command: **(leave blank)**
   - Build output directory: **/** (root)
4. Deploy → you’ll get a free live URL.

### Option 2: GitHub Pages (free)
1. Create a GitHub repo and push these files to the default branch.
2. GitHub → **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: your default branch, folder: **/(root)**
5. Save → wait for the Pages URL to appear.

## “Interactive” form notes (important)
This mockup **does not send emails by default** (static hosting has no backend).
- Submissions are stored in your browser’s `localStorage`.
- After submit, click **Copy details** and paste into an email/CRM.

### Make the form actually deliver leads (still free)
Use a free form endpoint service (e.g. Formspree / Getform / Basin) and point the form to it.

What to change:
- Add `action="YOUR_ENDPOINT_URL"` and `method="POST"` to:
  - `#leadForm`
  - `#heroLeadForm`
  - `#modalLeadForm`

If you want, tell me which provider you prefer and I’ll wire the exact endpoint + field names.

## Carrd / Wix requirement (how to comply fast)
I can’t publish to Carrd/Wix from this workspace, but you can recreate this mockup quickly:

### Carrd (free)
- Create: **Landing** template (blank)
- Add sections in order:
  - Header: Logo + nav links + buttons
  - Hero: Headline, paragraph, 2 CTAs
  - Services: 3 columns
  - Who we help: 2 tabs (or 2 side-by-side blocks)
  - Process: 3 steps
  - FAQ: 3 collapsible items
  - Lead: form with Name/Phone/Email/Business Type
- For “Book a call” modal: use Carrd **Modal** element + embed this page’s form fields.

### Wix (free)
- Use a blank landing page template
- Add the same section blocks
- Use Wix Forms for the lead form

## Submitting deliverables
They asked for:
1. Live landing page link
2. Desktop screenshot
3. Mobile screenshot
4. Platform used
5. Time taken

If you must claim “Carrd” or “Wix”, build it there using the checklist above and submit that live link.
