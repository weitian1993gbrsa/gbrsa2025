# GBRSA 2025 — Jump Rope Judge & Scoring App

## 🔑 Quick Facts
- **Type**: Progressive Web App (PWA)  
- **Frontend**: HTML / JavaScript / CSS (Netlify hosted)  
- **Backend**: Google Apps Script Web App (linked to Google Sheets)  
- **Purpose**: Judge & scoring system for jump rope competitions  
- **Key Features**: Login, Speed judging, Freestyle judging, Live scoring  

---

## 📖 Overview
GBRSA 2025 is a lightweight, mobile-friendly **judging and scoring app**.  
It is optimized for **speed, simplicity, and reliability**.  

- Judges **log in securely** (credentials stored in Google Sheets).  
- Scores are **submitted in real time** to Google Sheets.  
- Runs offline (PWA) and works well on tablets/phones.  

---

## 🎯 Features
- 🔐 **Secure login system**  
  - Session-based (auto logout when app closes).  
  - No localStorage (safer).  

- ⚡ **Fast performance**  
  - Debounced competitor lookup.  
  - In-memory cache for repeat lookups.  

- 📱 **Optimized UI**  
  - Fullscreen mobile layout.  
  - No-zoom, touch-friendly.  
  - Light theme for readability.  

- 🏆 **Judging modes**  
  - **Speed**: count repetitions.  
  - **Freestyle**: performance scoring.  

---

## 📂 Project Structure
```
frontend/              → Netlify frontend
  index.html           → Main scoring UI
  login.html           → Judge login page
  freestyle.html       → Freestyle judging
  speed.html           → Speed judging
  app.js               → Core logic
  auth.js              → Session enforcement
  config.js            → Backend API + Sheet IDs
  styles.css           → UI theme
  manifest.json        → PWA metadata
  service-worker.js    → PWA install handler
  nozoom.js            → Mobile UX helper

Google AppScript login form.txt   → Login validator backend
Google AppScript judge form.txt   → Scoring handler backend
README.md                         → Project documentation
```

---

## ⚙️ Setup Instructions

### 1. Deploy Backend (Google Apps Script)
1. Open [Google Apps Script](https://script.google.com/).  
2. Create a new project.  
3. Paste code from:  
   - `Google AppScript login form.txt`  
   - `Google AppScript judge form.txt`  
4. Link to your **Google Sheets** (judge credentials + scoring).  
5. Deploy → **Web App**:  
   - Execute as: *Me*  
   - Access: *Anyone with link*  
6. Copy the deployed **Web App URL**.  

---

### 2. Configure Frontend
Edit `frontend/config.js`:

```js
window.CONFIG = {
  APPS_SCRIPT_URL: "YOUR_DEPLOYED_WEBAPP_URL",
  SHEET_ID: "YOUR_GOOGLE_SHEET_ID",
  DATA_SHEET_NAME: "Data",
  RESULT_SHEET_NAME: "Result"
};
```

---

### 3. Deploy Frontend (Netlify)
1. Push this repo to **GitHub**.  
2. In [Netlify](https://app.netlify.com/):  
   - Add new site → Import from GitHub.  
   - Select repo → Deploy.  
   - (No build step needed — static files only).  
3. Netlify provides a URL, e.g.:  
   ```
   https://gbrsa2025.netlify.app
   ```

---

## 👥 Usage
1. Judges open the Netlify site on a device.  
2. Log in with credentials.  
3. Choose **Speed** or **Freestyle** judging.  
4. Scores auto-save to Google Sheets.  

---

## 🛡 Security Notes
- Sessions reset automatically when app closes.  
- No sensitive data in localStorage.  
- Backend always validates login before saving scores.  

---

✅ This README is now:  
- **Human-readable** (clear guide for developers & judges).  
- **AI-readable** (structured sections, keywords, file mappings).  
