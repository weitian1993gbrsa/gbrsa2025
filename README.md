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
1. Deploy the `frontend/` folder to Netlify.  
2. Update `config.js` with:  
   - `API_URL` → Apps Script Web App URL  
   - `API_KEY` (if configured)  

---

# 🏗️ System Architecture

The system is designed as a **lightweight 3-tier app**:

## 1. **Frontend (Judge’s Device)**
Runs as a **Progressive Web App (PWA)** on tablets/phones.  
- **Pages**:
  - `index.html` → Home/start  
  - `speed.html` → Speed event scoring (active)  
  - `freestyle.html` → Freestyle scoring (planned)  
- **Core Scripts**:
  - `app.js` → utilities (toast notifications, caching, API wrappers)  
  - `speed.js` → speed event scoring logic (ID stabilization, result submission)  
- **Key Features**:
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

## 3. **Database Layer (Google Sheets)**
The central “database” is just a Google Spreadsheet with at least two tabs:  
- **Data** → Competitor info (ID, Name, Country, Division, etc.)  
- **Result** → Judge submissions (ID, Score, Judge, Timestamp, Flags)  

Advantages:
- No separate DB setup needed  
- Judges’ results are instantly visible to organizers  
- Easy export to CSV/Excel for event summaries  

---

# 🔄 Data Flow Example

**Speed Judge records a result:**
1. Judge opens `speed.html` → enters **competitor ID**.  
2. Frontend calls → `GET ?cmd=participant&entryId=123`.  
3. Backend (Apps Script) finds competitor row in **Data sheet** → returns JSON.  
4. Judge enters score + false start toggle → presses Submit.  
5. Frontend sends → `POST { "entryId": "123", "judge": "Alice", "score": 95 }`.  
6. Backend appends row in **Result sheet** with timestamp.  
7. Toast confirmation → judge moves to next competitor.  

---

# 🖼️ Architecture Diagram (Text Form)

