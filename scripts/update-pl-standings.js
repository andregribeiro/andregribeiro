const https = require('https');
const fs = require('fs');

const API_KEY = process.env.FOOTBALL_API_KEY;

async function fetchStandings() {
  const options = {
    hostname: 'api.football-data.org',
    path: '/v4/competitions/PL/standings',
    headers: { 'X-Auth-Token': API_KEY }
  };

  return new Promise((resolve, reject) => {
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve(JSON.parse(data).standings[0].table);
      });
    }).on('error', reject);
  });
}

async function updateReadme() {
  const standings = await fetchStandings();
  const standingsTable = generateMarkdownTable(standings);
  
  let readme = fs.readFileSync('README.md', 'utf8');
  const startMarker = '<!-- STANDINGS:START -->';
  const endMarker = '<!-- STANDINGS:END -->';
  
  const newContent = `${startMarker}\n${standingsTable}\n${endMarker}`;
  readme = readme.replace(
    new RegExp(`${startMarker}[\\s\\S]*${endMarker}`),
    newContent
  );
  
  fs.writeFileSync('README.md', readme);
}

function generateMarkdownTable(standings) {
  const header = '| Pos | Club | P | W | D | L | GD | Pts |\n|-----|------|---|---|---|---|----|----|';
  const rows = standings.map(team => 
    `| ${team.position} | ${team.team.name} | ${team.playedGames} | ${team.won} | ${team.draw} | ${team.lost} | ${team.goalDifference} | ${team.points} |`
  );
  return [header, ...rows].join('\n');
}

updateReadme().catch(console.error);