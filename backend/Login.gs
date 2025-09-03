function doPost(e) {
  var sheet = SpreadsheetApp.openById("1HHcKiZJ28qXgu6Smq8r-UXcnzDUzsrbvAK9E3bsfATQ").getSheetByName("Users");
  var body = JSON.parse(e.postData.contents);

  var userId = body.userId;
  var password = body.password;

  var data = sheet.getDataRange().getValues(); // assumes header row: UserID | Password
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == userId && data[i][1] == password) {
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: false }))
                       .setMimeType(ContentService.MimeType.JSON);
}