# paulinekookt

Websites for **paulinekookt.nl** (Nederlands) and **paulinekocht.de** — catering by Pauline, Arcen.
Hosted on Netlify (site `glittery-kulfi-5e036b`), built from GitHub repo `iamashe/paulinekookt`.

## Layout
- `web/` — the published static site (what Netlify serves). Do not edit by hand; regenerate from `site/`.
- `site/` — the editable website source (Next.js-style app via vinext, bilingual NL/EN copy in `app/content.ts`, images in `public/images/`).

## Rebuild workflow (on prometheus)
```bash
cd ~/paulinekookt/paulinekookt/site
export PATH="$HOME/.npm-global/bin:$PATH"   # pnpm 11
pnpm install --frozen-lockfile
pnpm build
node_modules/.bin/vinext start &            # local server on :3000
curl -s http://127.0.0.1:3000/ > ../web/index.html
cp -r dist/client/. ../web/                 # refresh hashed assets, images, fonts
```
Then commit and push — Netlify publishes `web/` automatically (~1 min).

Notes:
- The original package (`Pauline-Cooks-Website-Full-Package-2.zip`) targeted Cloudflare Workers; this repo serves the same app as a static snapshot (the page is fully static: no backend, contact form opens an email/WhatsApp draft).
- Contact details live in `site/app/content.ts` and `site/app/page.tsx` — confirm email/phone before big changes.
- `web/_headers` sets immutable caching for content-hashed assets.
