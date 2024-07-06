const {google } = require('googleapis');
const { writer } = require('repl');
const {getCategoryByAchievementId} = require('./database')

const auth = new google.auth.GoogleAuth({
  keyFile:'./google.json',
  scopes:['https://www.googleapis.com/auth/spreadsheets']
});

async function writeTosheet(values) {
  const sheets = google.sheets({version:'v4', auth});;
  const spreadsheetId = '1VDNj8_aJf8_KSNyQp4cMly-r2qisC9Xu_4V_BL79jiU';
  const range='Sheet1!A1';
  const valueInputOption = 'USER_ENTERED';

  const resource = {values};
  try{
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId, range, valueInputOption, resource
    })
    return res;
  } catch(error) {
    console.log(error);
  }
}

async function addAchievementToSheet(achievement, achievement_id, studentName, group) {
  const { userId, title, category } = achievement;
  const isChecked = 'НЕТ'; // Default value for the checkbox

  if (!achievement_id || !studentName) {
      console.error('Invalid achievement_id or studentName');
      return;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1v99UhoHBlIXGfiZxe1i4_6o1TflZvIdc8ddIuD7Fc6A';
  let range;

  // Determine the sheet name based on the category
  switch (category) {
      case 'scientific':
          range = 'scientific';
          break;
      case 'sports':
          range = 'sports';
          break;
      case 'cultural':
          range = 'cultural';
          break;
      case 'other':
          range = 'other';
          break;
      default:
          throw new Error(`Unknown category: ${category}`);
  }

  const valueInputOption = 'USER_ENTERED';
  const values = [
      [achievement_id, userId, group, studentName, title, isChecked],
  ];

  const resource = {
      values,
  };

  try {
      const res = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption,
          resource,
      });
      return res;
  } catch (error) {
      console.error('Error appending data to Google Sheets:', error);
  }
}

async function removeAchievementFromSheet(achievement_id) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1v99UhoHBlIXGfiZxe1i4_6o1TflZvIdc8ddIuD7Fc6A';
  const category = await getCategoryByAchievementId(achievement_id);
  let range;

  // Determine the sheet name based on the category
  switch (category) {
      case 'scientific':
          range = 'scientific';
          break;
      case 'sports':
          range = 'sports';
          break;
      case 'cultural':
          range = 'cultural';
          break;
      case 'other':
          range = 'other';
          break;
      default:
          throw new Error(`Unknown category: ${category}`);
  }

  try {
      const sheetData = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
      });

      const rows = sheetData.data.values;

      // Find the row index with the specified achievement_id
      const rowIndex = rows.findIndex(row => row[0] == achievement_id);

      if (rowIndex === -1) {
          console.error('Achievement ID not found in the sheet');
          return;
      }

      // Build the range for the row to be deleted
      const deleteRange = `${range}!A${rowIndex + 1}:${range}!${rows[0].length > 0 ? String.fromCharCode(65 + rows[0].length - 1) : 'F'}${rowIndex + 1}`;

      await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
              requests: [{
                  deleteDimension: {
                      range: {
                          sheetId: sheetData.data.sheetId,
                          dimension: 'ROWS',
                          startIndex: rowIndex,
                          endIndex: rowIndex + 1
                      }
                  }
              }]
          }
      });

      console.log(`Achievement with ID ${achievement_id} removed from the ${category} sheet.`);
  } catch (error) {
      console.error('Error removing data from Google Sheets:', error);
  }
}

module.exports = { addAchievementToSheet, removeAchievementFromSheet };

// Example usage (you can remove this part in production)
// (async () => {
//   const exampleAchievement = {
//       userId: 71225845,
//       title: 'Sex',
//       category: 'sports',
//   };
//   const achievementId = 16; // Replace with the actual achievement ID
//   const studentName = 'Ivan Shrek'; // Replace with the actual student name
//   await addAchievementToSheet(exampleAchievement, achievementId, studentName, '228');
// })();

(async () => {
  const achievementId = 5; // Replace with the actual achievement ID
  const category = 'sports'; // Replace with the actual category
  await removeAchievementFromSheet(achievementId);
})();