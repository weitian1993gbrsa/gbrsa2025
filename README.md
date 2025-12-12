# GBRSA RopeScore Web App

**GBRSA RopeScore** is an official web-based judging system designed for rope skipping competitions organized by **GB Rope Skipping Academy (GBRSA)**.

The app is optimized for **tablet use**, **offline-friendly operation**, and **fast, error-resistant judging** during live competitions.

---

## ✨ Key Features

- **Multi-Event Support**
  - Speed
  - Freestyle (Difficulty, Technical, Presentation, RE)

- **Judge-Optimized UI**
  - Large tap targets
  - No accidental zoom
  - Stable layouts on iOS / Android tablets
  - Minimal animations for official judging

- **Two-Stage Presentation Judging**
  - Page 1: Live marking
  - Page 2: Final confirmation & adjustment
  - No data loss when navigating between pages

- **Secure Judge Access**
  - Access via assigned judge codes
  - Role-based routing (station + judge type)

- **Reliable Submission**
  - Submission overlay blocks double taps
  - Data sent to Google Sheets backend
  - Safe retry behavior

- **Offline-Resilient**
  - Local state handling
  - Station caching
  - Safe recovery from navigation / reloads

---

## 🧭 App Structure

```
/
├── index.html
├── speed-station.html
├── freestyle-station.html
│
├── speed-judge.html
├── freestyle-difficulty.html
├── freestyle-technical.html
├── freestyle-presentation.html
├── freestyle-presentation summary.html
├── freestyle-re.html
│
├── app.js
├── judge-core.js
├── judge-forms.js
├── station-core.js
│
├── config.js
└── manifest.json
```

---

## 🧑‍⚖️ Judge Flow

1. Login with access code  
2. Select station & participant  
3. Judge performance  
4. Submit score  
5. Continue to next participant  

---

## 🎯 Design Principles

- Consistency over complexity
- Predictable behavior for judges
- No hidden judging state
- Minimal animation
- Competition-safe UI

---

## 🧩 Backend

- Google Apps Script
- Google Sheets as data store
- Supports concurrent judges

---

## 🏁 Project Status

✅ Production Ready  
✅ Competition Tested  
✅ Officially Completed  

judge-forms.js = the UI scoring logic
judge-forms.js controls how judges input scores + how score is computed.

What it does:
Adds event listeners to buttons (miss, break, +/-, undo, reset, sliders, numpad, etc.)
Tracks values in memory (page1Data, technicalMisses, counts, etc.)
Knows how to calculate the score object for that judge type via getScore()

Example outputs:
Speed: { SCORE: 123, "FALSE START": "YES" }
Technical: { MISSES: 2, BREAKS: 1, SPACE: 0 }
Presentation: { PRESENTATION: 13.6 }

---------------------------------------------------------------------------------------------

judge-core.js = the submission engine
judge-core.js is the transport + submit workflow.

What it does:
Reads the current participant info (currentEntry) from localStorage / URL
Reads judge identity info (station, judgeType, key, etc.)
Calls the backend (apiPost / Apps Script endpoint) with:
participant fields (ID, heat, names, station, event, division…)
the score returned by JudgeForms[judgeType].getScore() or a buildScore() callback
Shows/hides submit overlay
Locks button to prevent double-submit
Handles success/fail (redirect back, show error, etc.)

---

© 2025 **GB Rope Skipping Academy (GBRSA)**  
All rights reserved.
