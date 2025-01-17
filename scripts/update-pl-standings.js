// scripts/update-standings.js
const fs = require('fs');
const axios = require('axios');

const apiKey = process.env.FOOTBALL_API_KEY;
const standingsUrl = 'URL_TO_FETCH_STANDINGS';

async function updateStandings() {
  try {
    const response = await axios.get(standingsUrl, {
      headers: { 'X-Auth-Token': apiKey },
    });

    const standings = response.data;
    // Process and update README.md with the new standings

    fs.writeFileSync('README.md', `# Premier League Standings\n\n${JSON.stringify(standings, null, 2)}`);
  } catch (error) {
    console.error('Error updating standings:', error);
    process.exit(1);
  }
}

updateStandings();