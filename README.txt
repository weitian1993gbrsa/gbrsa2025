# GBRSA 2025 Web App

This project is a **Judge Scoring System** for GBRSA competitions.  
It is built with a Google Apps Script backend + a static frontend (HTML/JS).

## 🔑 Features
- **Judge Login**: Judges must log in using credentials stored in the `Judges` tab of the Google Sheet.
- **Secure Token**: After login, judges receive a token valid for 1 hour. All submissions require this token.
- **Score Submission**: Judges can submit scores for participants. Submissions are logged in the `Result` tab with timestamp and judge name.
- **Navigation Flow**:
  1. Judges open the site → see **login page** (`index.html`).
  2. On successful login → redirect to **home page** (`home.html`).
  3. From **home.html**, judges can choose **Speed Judge** or **Freestyle Judge** pages.
  4. **Return buttons** on judge pages bring them back to home, without logging out.
  5. Judges stay logged in until their token expires (or until you add a logout button).

## 📂 Important Files
- `index.html` → Login page
- `home.html` → Judge dashboard / homepage
- `speed.html` → Speed judging page
- `freestyle.html` → Freestyle judging page
- `README.txt` → This guide

## ⚙️ Backend (Google Apps Script)
- `doGet` → Participant lookup (by ID)
- `doPost`:
  - `login` → Judge authentication
  - `submitscore` → Save judge scores into Google Sheet

## 📝 Notes for ChatGPT
- This project is a **scoring web app** with login protection.  
- Judges log in, then submit scores for participants.  
- Data is stored in Google Sheets (`Data`, `Result`, `Judges` tabs).  
- The flow is now: Login → Home → Judge Pages → Return to Home.  
