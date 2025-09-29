# GBRSA 2025 — Jump Rope Judge & Scoring App

## 🔑 Quick Facts
- **Type**: Progressive Web App (PWA)  
- **Frontend**: HTML / JavaScript / CSS (Netlify hosted)  
- **Backend**: Google Apps Script Web App (linked to Google Sheets)  
- **Purpose**: Judge & scoring system for jump rope competitions  
- **Key Features**: Speed judging, Freestyle judging, Live scoring  

---

## 📖 Overview
GBRSA 2025 is a lightweight, mobile-friendly **judging and scoring app**.  
It is optimized for **speed, simplicity, and reliability**.  

- Judges open the homepage and select **Speed** or **Freestyle** judging.  
- Scores are **submitted in real time** to Google Sheets.  
- Runs offline (PWA) and works well on tablets/phones.  

---

## 🎯 Features
- ⚡ **Fast performance**  
  - Debounced competitor lookup.  
  - In-memory cache for repeat lookups.  

- 📱 **Optimized UI**  
  - Fullscreen mobile layout.  
  - No-zoom, touch-friendly.  
  - Light theme for readability.  

- 🏆 **Judging modes**  
  - **Speed**: scan QR → lookup → input score → submit.  
  - **Freestyle**: (coming soon).  

---

## 📂 Project Structure
```
frontend/              → Netlify frontend
  index.html           → Homepage (choose judging mode)
  freestyle.html       → Freestyle judging
  speed.html           → Speed judging
  app.js               → Core logic
  config.js            → Backend API + Sheet IDs
  styles.css           → UI theme
  manifest.json        → PWA metadata
  service-worker.js    → PWA install handler
  nozoom.js            → Mobile UX helper

judge_form_ui.html     → Tailwind Judge Form (participant lookup & scoring)
Google AppScript judge form.txt   → Backend scoring handler
README.md              → Project documentation
```

---

## ⚙️ Setup Instructions

### 1. Deploy Backend (Google Apps Script)
1. Open [Google Apps Script](https://script.google.com/).  
2. Create a new project.  
3. Paste code from:  
   - `Google AppScript judge form.txt`  
4. Link to your **Google Sheets** (competition data + scoring).  
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
2. From homepage, choose **Speed** or **Freestyle** judging.  
3. Input scores as required.  
4. Scores auto-save to Google Sheets.  

---

### 🆕 Tailwind Judge Form UI

We now include a **mobile-optimized Tailwind UI** for the Judge Form.

- **File**: `judge_form_ui.html`  
- **Purpose**: Provides a responsive participant lookup and scoring start page.  
- **Integration**: Loaded by default in backend `doGet` when no `cmd` parameter is passed.  
- **Dynamic data**: Fetches participant data from Google Sheets using `?cmd=participant&entryId=...`.  
- **Flexible**: Displays all participant names for a team (not limited to 4).  

---

✅ This README matches the **no-login** setup and the actual homepage → judge flow.  
