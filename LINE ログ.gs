var CHANNEL_ACCESS_TOKEN = "oLw9aAOKdRKvOkoUotLsBccB4Q0TTDvEeulGntu2TJkPTYT+XHDcrKFHsAPipp6/rCfs1mSxEdXWxfxJlZqcKGagXo/GdNLuZmhBUWKbxWGoKIrJrRxGjWQhkyniZnho+pF7H/kQowFZ/Hl1klHKYAdB04t89/1O/w1cDnyilFU=";
var SPREADSHEET_ID = "1mSUhipSh-816PBaMXqHhvVmfO2nBbyFNWvB3Q3T3Moc";
var SHEET_NAME = "LINEログ";

function doPost(e) {
  var contents = JSON.parse(e.postData.contents);

  if (contents.events) {
    for (var i = 0; i < contents.events.length; i++) {
      var event = contents.events[i];
      if (event.type == "message") {
        var timestamp = new Date(event.timestamp);
        var userId = event.source.userId;
        var userName = getUserName(userId);
        var text = event.message.text;
        updateOrCreateMessage(timestamp, userId, userName, text);

        console.log(updateOrCreateMessage);

      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true }));
}

function updateOrCreateMessage(timestamp, userId, userName, text) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var found = false;
  for (var i = 2; i < data.length; i++) { // Start from row 1 to skip headers
    if (data[i][1] == userId) { // Check if userId already exists in the sheet
      sheet.getRange(i + 1, 1, 1, 4).setValues([[timestamp, userId, userName, text]]);
      found = true;
      return;
    }
  }

  if (!found) { // If userId does not exist, append a new row
    sheet.appendRow([timestamp, userId, userName, text]);
  }
}

function getUserName(userId) {
  var profileUrl = 'https://api.line.me/v2/bot/profile/' + userId;
  var options = {
    "method": "get",
    "headers": {
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN
    }
  };
  var response = UrlFetchApp.fetch(profileUrl, options);
  var profile = JSON.parse(response.getContentText());
  return profile.displayName;
}
