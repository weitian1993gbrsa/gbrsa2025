// backend/Code.gs

// Example users with SHA-256 hashed passwords (Base64 encoded)
var USERS = {
  "admin01": "B+qvfeaa7rP9QGcT+3Uyh5Zyl3vF4hmR/N5NQ7B5qU4=",
  "user02": "G8tiUrAg2QJc2S2i5W0RZSYUuzFqBb9yKfFOV1K7aFk="
};

// Hash and compare password
function checkLogin(username, password) {
  var storedHash = USERS[username];
  if (!storedHash) return false;

  var hash = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
  );
  return storedHash === hash;
}

// Handle login requests
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var username = data.username;
  var password = data.password;

  var ok = checkLogin(username, password);

  return ContentService.createTextOutput(
    JSON.stringify({ success: ok })
  ).setMimeType(ContentService.MimeType.JSON);
}
