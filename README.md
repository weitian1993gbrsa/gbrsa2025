
# GBRSA Judging (Netlify ready)

Vite + React + TypeScript + Tailwind + **BrowserRouter** with SPA redirects.

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to Netlify
- **Repo flow:** Connect this repo in Netlify. Build command: `npm run build` • Publish dir: `dist` (already in `netlify.toml`).
- **Drag & drop:** `npm run build` then drag the `dist/` folder to https://app.netlify.com/drop
- SPA is configured with `public/_redirects` and `netlify.toml`.

Custom domain: add it in Netlify → Domains, then set DNS (or use Netlify DNS).

