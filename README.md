# GBRSA Jump Rope Judge App — *Light + Fast*

## 📖 Overview
This is a **web-based judging and scoring system** for jump rope competitions.  
It is designed to be **simple, fast, and reliable** so judges can focus on the athletes, not the software.  

The app runs as a **Progressive Web App (PWA)**, connected to **Google Sheets** for live data.  
- **Frontend**: Lightweight HTML/JS/CSS (runs in browser, works well on tablets/phones).  
- **Backend**: Google Apps Script Web App (fetches competitor data and saves results).  

---

## 🎯 Features

### Frontend
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
- **Fast ID lookup** using `TextFinder` on column `A` of the **Data sheet**.  
- Competitor IDs normalized (handles leading zeros).  
- **Endpoints**:
  - `GET ?cmd=participant&entryId=...` → returns competitor info.  
  - `POST` (JSON body) → appends judge’s result to the **Result sheet**, with timestamp.  
  - `GET ?cmd=ping` → health check.  
- Fully integrated with **Google Sheets**:  
  - `Data` sheet → competitor info.  
  - `Result` sheet → scores and judging records.  

---

## 🚀 Deployment

### Backend (Google Apps Script)
1. Copy `backend/Code.gs` into a new Apps Script project.  
2. Set script properties for:
   - `SHEET_ID` → Google Sheet ID.  
   - `DATA_SHEET_NAME` (default `"Data"`).  
   - `RESULT_SHEET_NAME` (default `"Result"`).  
3. Deploy as a **Web App** (accessible via URL).  

### Frontend (Netlify)
1. Deploy the `frontend/` folder to [Netlify](https://www.netlify.com/) (or any static host).  
2. Update `config.js` with the **backend Web App URL**.  
3. Judges can now access the app via browser or install it as a PWA.  

---

## ⚡ Judge Workflow
1. Judge opens app (`index.html`).  
2. Chooses event: **Speed** or **Freestyle**.  
3. Enters competitor **ID** → app fetches details from the **Data sheet**.  
4. Judge enters score (jump counts or freestyle scores).  
5. App **submits results** to the **Result sheet** with timestamp.  

---

✅ **Light, fast, judge-friendly** — built for smooth competition scoring.  
