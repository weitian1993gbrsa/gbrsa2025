
# GBRSA Judging (GH Pages ready)

Vite + React + TypeScript + Tailwind + **HashRouter** so it works on GitHub Pages without server config.

## Local Development
```bash
npm install
npm run dev
# open the printed localhost URL
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
- Push this repo to GitHub (main branch).
- Ensure **Settings → Pages → Source = GitHub Actions**.
- The workflow `.github/workflows/pages.yml` will build and publish automatically to the `github-pages` environment.
- Your site will be available at `https://<username>.github.io/<repo>/`.

Hash-based URLs look like `/#/speed` — this avoids 404s on static hosts.

## Structure
- `src/pages/Landing.tsx` — landing page.
- `src/pages/Speed.tsx` — placeholder.
- `src/pages/Freestyle.tsx` — placeholder.

Replace `/public/logo.svg` with your real logo.
