// backend/Code.gs

// Simple users with plaintext passwords (for testing only!)
var USERS = {
  "admin01": "admin123",
  "user01": "user123"
};

function checkLogin(username, password) {
  var storedPass = USERS[username];
  if (!storedPass) return false;
  return storedPass === password; // direct compare
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var username = data.username;
  var password = data.password;

  var ok = checkLogin(username, password);

  return ContentService.createTextOutput(
    JSON.stringify({ success: ok })
  ).setMimeType(ContentService.MimeType.JSON);
}
