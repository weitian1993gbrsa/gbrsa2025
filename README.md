# GBRSA 2025 — Jump Rope Judge & Scoring (Latest)

**Status:** Updated — includes mobile (iOS & Android) fixes, QR camera scanning, PWA support, backend integration, and UX/accessibility improvements.

---
## Project overview
This repository contains the judge frontend (PWA) and the Google Apps Script backend used for GBRSA 2025 jump-rope competitions. The app supports Speed judging (and scaffold for Freestyle), QR scanning for quick participant lookup, manual entry fallback, and direct submission to a Google Sheet via Apps Script.

---
## What's included (latest features)
### Frontend (`frontend/`)
- **Entry / Scan UI** (`index.html`, `speed.html`, `speed.js`):
  - QR camera scanning with robust camera initialization and `playsinline` support for iOS.
  - Manual ID input fallback (with `inputmode` where appropriate) when camera is unavailable.
  - Participant lookup and card view with metadata (names, team, state, tags).
  - Score entry form with **FALSE START** checkbox (native checkbox restored and touch-optimized).
  - Submit results to backend with validation and friendly to mobile networks.

- **iOS-specific fixes** (iterative improvements):
  - Prevent iOS auto-zoom on input focus by enforcing `font-size:16px` for text-like inputs and applying `-webkit-text-size-adjust:100%` on the page.
  - Injected focus handlers to ensure inputs keep a stable font-size on `focusin` (helps edge cases).
  - Viewport meta tuned (the code uses `maximum-scale=1,user-scalable=no` to strictly prevent zoom) — we also included notes and an alternative JS-only approach if you prefer to preserve pinch-to-zoom accessibility.
  - Removed custom document-level pull-to-refresh touch handlers that conflicted with native iOS pull-to-refresh gestures.

- **Checkbox & form UI fixes**
  - Restored native appearance for checkboxes and radio buttons that were previously hidden by a global `-webkit-appearance: none` rule.
  - Styles updated to keep checkboxes visible, tappable, and accessible on mobile devices.

- **PWA / Offline support**
  - `manifest.json` for installability and icons included (`icon-192.png`, `icon-512.png`).
  - `service-worker.js` present and claiming clients. Basic caching patterns are ready; you can extend the service worker to add runtime/static caching strategies per needs.

- **Stability & UX**
  - `nozoom.js` and other helper scripts tuned to improve input and camera behavior on mobile.
  - Toast notifications, clear error messaging for network/backend failures, and graceful fallback flows.

### Backend (`Google AppsScript judge form.txt`)
- Google Apps Script serving two main endpoints:
  - `?cmd=participant&entryId=...` — lookup participant in a Google Sheet.
  - `POST` to save results into the Results sheet.
- JSON response format `{ ok: boolean, data: ..., error: ... }` for predictable frontend handling.
- Comment inserted reminding to deploy the Apps Script as **Anyone, even anonymous** if you do not intend to use OAuth from the frontend.
- Basic concurrency guards using `LockService` present (review deployment and throttle settings for high-load use).

---
## Deployment & configuration (concise)

### Frontend
1. Edit `frontend/config.js` and set `APPS_SCRIPT_URL` to your deployed Google Apps Script URL.
2. Host the `frontend/` folder on HTTPS (Netlify, GitHub Pages on HTTPS, or similar).
3. Ensure `manifest.json` and `service-worker.js` remain available at root of the deployed site.

### Backend (Google Apps Script)
1. Create a new Apps Script project and paste the content of `Google AppsScript judge form.txt` as `Code.gs` (or separate files).
2. Set Project Properties for `SHEET_ID`, `DATA_SHEET`, `RESULT_SHEET` if used, or modify the constants in-script.
3. Deploy > New deployment > **Web app**:
   - Execute as: **Me (your account)**
   - Who has access: **Anyone, even anonymous** (recommended for simple frontend-only setup)
4. Copy the web app URL and set it into `frontend/config.js`.

---
## How iOS fixes were implemented (technical summary)
- Inputs auto-zoom prevention:
  - CSS: `input[type='text'], input[type='number'], textarea, select { font-size: 16px !important; -webkit-text-size-adjust: 100% !important; }`
  - JS: `focusin` listener that sets `style.fontSize='16px'` when a control is focused. Clears on `focusout`.
  - Viewport meta: `maximum-scale=1,user-scalable=no` applied to reduce unexpected zoom on focus (can be reverted if you want pinch-to-zoom).
- Camera inline mode:
  - All `<video>` elements use `playsinline`, `autoplay`, `muted`, and JS sets `videoEl.playsInline = true`.
  - When camera fails, app shows a clear fallback to manual entry.
- Removed page-level custom pull-to-refresh to reinstate native browser behavior.

---
## Accessibility & touch targets
- Increased font / tap targets for inputs and buttons to be mobile-friendly and reduce accidental touches during scoring.
- If you want, we can replace the native checkbox with an accessible styled toggle control (bigger, clearer on mobile).

---
## Testing checklist (recommended)
- Desktop: full flow (lookup, confirm, scoring, submit) — verify sheet updates.
- Android (Chrome): test camera QR scanning, keyboard behavior, and touch interaction.
- iOS (Safari): test camera scanning, focus into ID/score inputs and ensure no auto-zoom, ensure FALSE START checkbox is visible and tappable, test pull-to-refresh.
- Offline: install site (PWA) and confirm service worker serves cached static assets (if implemented in service worker caching).

---
## Troubleshooting (common issues)
- **Camera permission denied**: Ensure HTTPS and user granted camera permission for site. If denied, rely on manual ID entry.
- **Backend unreachable**: Confirm Apps Script deployment URL is set in `frontend/config.js` and that web app is deployed with the correct access settings.
- **Checkbox missing**: Ensure `styles.css` deployed matches the current repo (v3+ includes the fix).

---
## Changelog (recent)
- **v1** — initial prototype (frontend + Apps Script).
- **v2** — removed pull-to-refresh, enforced `font-size:16px`, playsinline camera, basic patches.
- **v3** — fixed checkbox visibility (scoped -webkit-appearance), README improvements.
- **v4** — added strict viewport meta + focusin JS for more aggressive prevention of iOS auto-zoom.
- **v5 (this update)** — consolidated all mobile fixes, added README with full feature list, QA checklist, and packaged a fresh release.

---
## Next recommended improvements (optional)
- Replace native checkbox with a custom large toggle on score entry for easier mobile use.
- Implement robust service-worker runtime caching and cache versioning for offline resilience.
- Add simple CI (GitHub Actions) to run linters and build release zips automatically (without `.git/` folder in releases).
- Add an admin page for viewing recent results and simple re-submission or edits (with auth).

---
## Files changed in this release
- `frontend/index.html`, `frontend/speed.html`, `frontend/styles.css`, `frontend/speed.js`, `frontend/app.js` (tweaks)
- `judge_form_ui.html` (viewport & camera tweaks)
- `Google AppsScript judge form.txt` (deployment note)
- Backups: `.orig` copies created for modified files during patches.

---
If you'd like, I can:
- Commit these README changes into your GitHub repo and create a PR (I will prepare a patch text for you to paste), or
- Push the updated repo zip for you to upload (I've created a fresh zip for convenience).

---
**Download:** the updated project zip was created at `/mnt/data/gbrsa2025_fixed_v4.zip` (or v5 if you prefer a new name). Use that uploaded zip to push to GitHub or deploy to Netlify.

Thank you — glad the iOS fixes helped. If you'd like any wording adjustments to the README (shorter summary, more technical notes, or translation), I’ll update it right away.
