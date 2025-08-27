# GBRSA Score App — LIGHT + FAST
Frontend:
- Light theme
- Debounced lookup (300ms), in-memory cache, loading dots
- Vertical names (<br>), FALSE START: 'YES' checked, blank unchecked
- No offline mode
Backend:
- Fast ID lookup using TextFinder on A:A (exact match). Keep ID in A1 header 'ID', data from row 2.
Deploy: paste backend/Code.gs in Apps Script (deploy Web App), deploy frontend/ to Netlify.
