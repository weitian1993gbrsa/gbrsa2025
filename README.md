# GBRSA Jump Rope Judge App — *Light + Fast*

## 📖 Overview
This is a **web-based judging and scoring system** for jump rope competitions.  
It is designed to be **simple, fast, and reliable** so judges can focus on the athletes, not the software.  

The app runs as a **Progressive Web App (PWA)**, connected to **Google Sheets** for live data.  
- **Frontend**: Lightweight HTML/JS/CSS (runs in browser, works well on tablets/phones).  
- **Backend**: Google Apps Script Web App (fetches competitor data, handles login, and saves results).  

---

## 🔐 Login System (NEW)
- Judges must log in using **UserID + Password** before accessing the dashboard.  
- Credentials are stored in a **separate secure Google Sheet** (`Users` tab).  
- Each user has:
  - `UserID`
  - `Password`
  - `Role` (Judge/Admin)
  - `Active` (TRUE/FALSE to enable/disable login)

### How Login Works
1. Judge opens `login.html`.  
2. Enters **UserID** + **Password**.  
3. App sends request to backend with `{ action: "login", UserID, Password }`.  
4. Backend checks the Users sheet.  
   - If valid → returns success + role.  
   - If invalid/inactive → login denied.  
5. On success, session is stored in `localStorage`.  
6. Judges are redirected to `index.html` (dashboard).  
7. All main pages (`index.html`, `speed.html`, `freestyle.html`) are **protected** — if not logged in, user is redirected back to `login.html`.  

---

## 🎯 Features

### Frontend
- **Login page (login.html)** for secure access.  
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

### Backend (Apps Script)
- **Login handler** connected to secure Users sheet.  
- **Fast ID lookup** using `TextFinder` on column `A` of the **Data sheet**.  
- Competitor IDs normalized (handles leading zeros).  
- **Endpoints**:
  - `POST { action: "login" }` → checks login.  
  - `GET ?cmd=participant&entryId=...` → returns competitor info.  
  - `POST` (score body) → appends judge’s result to the **Result sheet**, with timestamp.  
  - `GET ?cmd=ping` → health check.  
- Fully integrated with **Google Sheets**:  
  - `Data` sheet → competitor info.  
  - `Result` sheet → scores and judging records.  
  - `Users` sheet (separate spreadsheet) → login accounts.  

---

## 🚀 Deployment

### Backend (Google Apps Script)
1. Copy `backend/Code.gs` into a new Apps Script project (on the competition Data/Result sheet).  
2. Set script properties for competition data if needed.  
3. Add your **Users Sheet ID** into the `USERS_SHEET_ID` constant in `Code.gs`.  
4. Deploy as a **Web App** (accessible via URL).  

### Frontend (Netlify)
1. Deploy the `frontend/` folder to [Netlify](https://www.netlify.com/) (or any static host).  
2. Update `config.js` with your deployed **Web App URL**. Example:

```javascript
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbx12345abcde/exec";
```

3. Judges can now access the app via browser or install it as a PWA.  

---

## ⚡ Judge Workflow
1. Judge opens app → redirected to `login.html`.  
2. Enters **UserID + Password** → backend validates with Users sheet.  
3. On success → redirected to dashboard (`index.html`).  
4. Chooses event: **Speed** or **Freestyle**.  
5. Enters competitor **ID** → app fetches details from the **Data sheet**.  
6. Judge enters score (jump counts or freestyle scores).  
7. App **submits results** to the **Result sheet** with timestamp.  

---

✅ **Light, fast, secure, and judge-friendly** — built for smooth competition scoring.  
