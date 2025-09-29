# GBRSA 2025 — Jump Rope Judge & Scoring (Updated)

This repository contains the frontend and backend for the GBRSA 2025 jump-rope judging system (Speed & Freestyle). This update fixes several mobile (iOS) issues and improves robustness for camera/QR scanning and input handling.

---
## Contents
- `frontend/` — PWA frontend (index, speed, styles, app logic, QR camera, service worker).
- `Google AppsScript judge form.txt` — Google Apps Script backend (participant lookup, result POST).
- `judge_form_ui.html` — simple standalone judge form UI (legacy/embedded use).
- `_redirects`, `manifest.json`, icons, and `assets/`.

---
## Quick start (frontend)

### Prerequisites
- HTTPS hosting (Netlify, GitHub Pages on a secure origin, or equivalent) is required for camera access (`getUserMedia`).
- A Google account with access to the destination Google Sheet for results/participants.

### 1) Configure backend URL
Open `frontend/config.js` and set `APPS_SCRIPT_URL` to your deployed Google Apps Script web app URL (see backend deployment below). Example:
```js
window.CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec"
};
```

### 2) Deploy frontend
- Option A: Netlify — connect repo and set build to use `frontend/` as the publish folder (if you are not building, publish contents directly).
- Option B: GitHub Pages — publish `frontend/` as the site root (ensure HTTPS is enabled).

### 3) Test
Open the site on desktop and mobile. For camera/QR, test on iOS Safari and Android Chrome over HTTPS.

---
## Backend (Google Apps Script) deployment

1. Create a new Google Apps Script project. Paste the contents of `Google AppsScript judge form.txt` as `Code.gs` (or as files as appropriate).
2. Set project properties (if used) or edit the script variables for `SHEET_ID`, `DATA_SHEET`, `RESULT_SHEET` as required.
3. Deploy → New deployment → Select `Web app`:
   - Execute as: **Me (your account)**
   - Who has access: **Anyone** or **Anyone, even anonymous** (choose anonymous if your frontend will call without OAuth)
4. Copy the web app URL and put it in `frontend/config.js`.

**Note:** If you use "Anyone, even anonymous" you do not need OAuth in the frontend. If you restrict access, the frontend must authenticate which is more complex.

---
## iOS / Mobile fixes included (v2 & v3)
This update addresses mobile issues reported on iOS Safari:
- Inputs were auto-zooming: set input font-size to `16px` for text/number inputs to prevent iOS zoom on focus.
- Checkbox visibility bug: restored native appearance for checkboxes and radios (`appearance: auto`) so the FALSE START box displays correctly.
- Removed a custom `touchstart/touchmove` pull-to-refresh handler which blocked native pull-to-refresh on iOS.
- Camera `<video>` elements now use `playsinline`, `autoplay`, and `muted` and JS enforces `videoEl.playsInline = true` to avoid fullscreen takeover on iOS.
- Added `inputmode="numeric"` suggestions in places where numeric ID entry is expected (you may add these to the templates if IDs are numeric-only).

---
## Service Worker & PWA notes
- `service-worker.js` claims clients and is ready for caching. Consider enabling runtime caching for static assets and network-first for HTML.
- `manifest.json` included for PWA installability — icons are present in `frontend/`.

---
## Troubleshooting checklist
- Camera not starting: ensure page is served over HTTPS and browser permissions are allowed.
- Checkbox missing: ensure `styles.css` was deployed (v3 contains the fix that restores checkbox appearance).
- Backend unreachable: verify Apps Script is deployed and `APPS_SCRIPT_URL` in `config.js` is correct and accessible from your client origin.
- CORS-like errors: prefer using "Anyone, even anonymous" for Google Apps Script web app if not doing OAuth flows.

---
## Changelog (high level)
- **v1 (original)**: initial project files.
- **v2**: fixed viewport, input font-size, video `playsinline`, removed pull-to-refresh JS, added backups.
- **v3 (this update)**: fixed checkbox visibility by scoping `-webkit-appearance:none` to text inputs; updated README with deploy/test instructions.

---
## Files changed in this release
- `frontend/index.html` — removed custom pull-to-refresh & updated viewport.
- `frontend/styles.css` — mobile input fixes; restored checkbox appearance.
- `frontend/speed.html` — ensured video uses `playsinline` attributes.
- `frontend/* .js` — ensure video playsinline safety and camera helpers.
- `judge_form_ui.html` — viewport & video tweaks.
- `Google AppsScript judge form.txt` — added deployment note comment.

---
## Next recommendations
- Add CI to auto-build and produce release zip without `.git/` folder.
- Add automated tests (linting) for frontend JS.
- Optional: replace native checkbox with an accessible styled toggle for better UX on mobile.

---
If you want, I can create a Git commit/PR with these README changes and the other patches applied. Tell me whether to (A) commit & create a patch/PR-style diff, or (B) just provide the updated zip (I already have the zip created).
