# GBRSA Jump Rope Judge App — *Light + Fast*

## 📖 Overview
This is a **web-based judging and scoring system** for jump rope competitions.  
It is designed to be **simple, fast, and reliable** so judges can focus on the athletes, not the software.  

The app runs as a **Progressive Web App (PWA)**, connected to **Google Sheets** for live data.  
- **Frontend**: Lightweight HTML/JS/CSS (runs in browser, works well on tablets/phones).  
- **Backend**: Google Apps Script Web App (fetches competitor data and saves results).  
- **Login System**: Judges must log in with credentials stored in a separate Google Sheet before scoring.  

---

## 🎯 Features

### Frontend

### 🔐 Updated Login System (2025)
- **Session-based login** using `sessionStorage` instead of `localStorage`.
- Judges are **automatically logged out** when:
  - The app is killed or refreshed.
  - The user switches away to another app/tab (backgrounded).
- Ensures no one can stay logged in indefinitely without re-authentication.

- **Login gate** (`login.html`) → judges must log in before accessing the homepage.  
- **Light theme** for readability.  
- **Debounced competitor ID lookup (300ms)** to avoid slow typing delays.  
- **In-memory cache** for instant repeat lookups.  
- **Loading dots** to show judges when the system is fetching data.  
- **Vertical competitor names** for clear score sheets.  
- **False start toggle** (“YES” = checked, blank = unchecked).  
- Separate pages for:
  - `speed.html` → Speed event scoring.  
  - `freestyle.html` → Freestyle event scoring.  
- **PWA ready**: `manifest.json` + service worker.  
- Deployable to **Netlify**.  

### Backend (Apps Script — Scoring)
- **Fast ID lookup** using `TextFinder` on column `A` of the **Data sheet**.  
- Competitor IDs normalized (handles leading zeros).  
- **Endpoints**:
  - `GET ?cmd=participant&entryId=...` → returns competitor info.  
  - `POST` (JSON body) → appends judge’s result to the **Result sheet**, with timestamp.  
  - `GET ?cmd=ping` → health check.  
- Fully integrated with **Google Sheets**:  
  - `Data` sheet → competitor info.  
  - `Result` sheet → scores and judging records.  

### Backend (Apps Script — Login)
- Separate **Login Apps Script project** connected to a **Judges sheet**.  
- Judges sheet must have:
  ```
  Username | Password
  judge1   | 1234
  judge2   | abcd
  ```
- **Endpoint**:
  - `POST { "cmd": "login", "username": "judge1", "password": "1234" }`  
  → returns `{ "ok": true, "token": "..." }` if valid.  
- Tokens cached temporarily for session handling.  
- Protects access to the judging system by requiring login before scoring.  

---

## 🚀 Deployment

### Backend (Google Apps Script — Scoring)
1. Copy `backend/Code.gs` into a new Apps Script project.  
2. Set script properties for:
   - `SHEET_ID` → Google Sheet ID.  
   - `DATA_SHEET_NAME` (default `"Data"`).  
   - `RESULT_SHEET_NAME` (default `"Result"`).  
3. Deploy as a **Web App** (accessible via URL).  

### Backend (Google Apps Script — Login)
1. Create a new Google Sheet called **Judges** with columns: `Username`, `Password`.  
2. Copy the login backend script (`Login.gs`) into a new Apps Script project.  
3. Set:
   ```js
   const LOGIN_SHEET_ID = "YOUR_JUDGES_SHEET_ID";
   ```
4. Deploy as a **Web App** (accessible via URL, set to *Anyone*).  
5. Copy the deployment URL into your `frontend/config.js`:  
   ```js
   const LOGIN_API_URL = "https://script.google.com/macros/s/DEPLOYMENT_ID/exec";
   ```

### Frontend

### 🔐 Updated Login System (2025)
- **Session-based login** using `sessionStorage` instead of `localStorage`.
- Judges are **automatically logged out** when:
  - The app is killed or refreshed.
  - The user switches away to another app/tab (backgrounded).
- Ensures no one can stay logged in indefinitely without re-authentication.
 (Netlify)
1. Deploy the `frontend/` folder to Netlify.  
2. Update `config.js` with:  
   - `API_URL` → scoring Apps Script Web App URL  
   - `LOGIN_API_URL` → login Apps Script Web App URL  

---

# 🏗️ System Architecture

The system is designed as a **lightweight 3-tier app**:

## 1. **Frontend (Judge’s Device)**
Runs as a **Progressive Web App (PWA)** on tablets/phones.  
- **Pages**:
  - `login.html` → Judge login  
  - `index.html` → Home/start (protected by login)  
  - `speed.html` → Speed event scoring (active)  
  - `freestyle.html` → Freestyle scoring (planned)  
- **Core Scripts**:
  - `app.js` → utilities (toast notifications, caching, API wrappers)  
  - `speed.js` → speed event scoring logic (ID stabilization, result submission)  
  - `auth.js` → login/session protection  
- **Key Features**:
  - Judge authentication required before scoring  
  - Competitor ID lookup (debounced + cached)  
  - Quick judge inputs (score fields, false start toggle)  
  - Toast confirmations after submissions  
  - Offline/PWA support (via `manifest.json` + `service-worker.js`)  

**Deployment** → Hosted on **Netlify**.  
Judges access via a secure URL on their device.

---

## 2. **Backend (Google Apps Script Web App)**
Acts as the **API server**, running in Google’s cloud.  

### Endpoints:
- `GET ?cmd=ping` → Health check  
- `GET ?cmd=participant&entryId=...` → Look up competitor info  
- `POST { ... }` → Save a judge’s score  

### Features:
- **Normalization**: Handles leading zeros in competitor IDs.  
- **Data Access**:
  - Reads from **Data sheet** (`competitor info`)  
  - Writes to **Result sheet** (`judge submissions`)  
- **Timestamping**: Each submission includes a time marker.  

**Deployment** → Published as a **Web App** in Google Apps Script.  

---

## 3. **Login Backend (Google Apps Script Web App)**
Dedicated script for judge authentication.  
- Reads credentials from **Judges sheet**.  
- Verifies username/password match.  
- Issues temporary token.  
- Integrated into `login.html` frontend.  

---

## 4. **Database Layer (Google Sheets)**
The central “database” is just Google Sheets with three tabs:  
- **Data** → Competitor info (ID, Name, Country, Division, etc.)  
- **Result** → Judge submissions (ID, Score, Judge, Timestamp, Flags)  
- **Judges** → User accounts (Username, Password)  

Advantages:
- No separate DB setup needed  
- Judges’ results are instantly visible to organizers  
- Easy export to CSV/Excel for event summaries  

---

# 🔄 Data Flow Example

**Judge login and scoring:**
1. Judge opens `login.html` → enters **username + password**.  
2. Frontend sends → `POST { cmd: "login", username, password }`.  
3. Login backend checks **Judges sheet** → returns `{ ok: true }` if valid.  
4. Judge redirected to `index.html`.  
5. Judge navigates to `speed.html` → enters **competitor ID**.  
6. Frontend calls → `GET ?cmd=participant&entryId=123`.  
7. Scoring backend finds competitor row in **Data sheet** → returns JSON.  
8. Judge enters score → presses Submit.  
9. Frontend sends → `POST { entryId, score }`.  
10. Backend appends row in **Result sheet** with timestamp.  
11. Toast confirmation → judge moves to next competitor.  

---
