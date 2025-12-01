window.CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw1UORMl0LqZPdxelb8DdWSKZUUcX3WL03GDUSM-GeLX9v-KYHeeeFwQ8epyS3va3RQTA/exec",
  SHEET_ID: "1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg",
  DATA_SHEET_NAME: "DATA",
  RESULT_SHEET_NAME: "RESULT"
};
// Login backend URL
const LOGIN_API_URL = "https://script.google.com/macros/s/AKfycbzq3LYbSAoFRjt8wIbomxwehCOdAdGo4eCkpHlhj_ncTm27tpQJyMhzQHRQTfhKQ6WJ/exec";


function forceRepaint() {
  document.body.classList.add("hidden");
  void document.body.offsetHeight;
  document.body.classList.remove("hidden");
}
