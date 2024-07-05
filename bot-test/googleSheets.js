const {google } = require('googleapis');
const { writer } = require('repl');

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

async function addAchievementToSheet(achievement) {
  const { userId, category, title } = achievement;
  const currTime = new Date().toISOString();

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1VDNj8_aJf8_KSNyQp4cMly-r2qisC9Xu_4V_BL79jiU';
  const range = 'Sheet1'; // Adjust if your sheet name is different
  const valueInputOption = 'USER_ENTERED';

  const values = [
      [userId, currTime, title, category],
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

module.exports = { addAchievementToSheet };
// (async()=>{
//   const wirter = await writeTosheet([['name', 'age', 'location'], ['ado', 33, 'saratov']]);
//   console.log(writer);
// })()

