// scripts/update-standings.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

async function fetchStandings() {
  try {
    const response = await axios.get(`${BASE_URL}/competitions/PL/standings`, {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });
    return response.data.standings[0].table;
  } catch (error) {
    console.error('Error fetching standings:', error.message);
    throw error;
  }
}

function generateMarkdownTable(standings) {
  const header = '| Pos | Club |  | P | W | D | L | GD | Pts |\n|-----|------|----|---|---|---|---|----|----|';
  const rows = standings.map(team => 
    `| ${team.position} | ${team.team.name} | ${team.team.crest} | ${team.playedGames} | ${team.won} | ${team.draw} | ${team.lost} | ${team.goalDifference} | ${team.points} |`
  );
  return [header, ...rows].join('\n');
}

async function updateStandings() {
  try {
    const standings = await fetchStandings();
    const standingsTable = generateMarkdownTable(standings);
    
    const readmePath = path.join(__dirname, '..', 'README.md');
    let readme = fs.readFileSync(readmePath, 'utf8');
    
    const startMarker = '<!-- STANDINGS:START -->';
    const endMarker = '<!-- STANDINGS:END -->';
    const newContent = `${startMarker}\n${standingsTable}\n${endMarker}`;
    
    readme = readme.replace(
      new RegExp(`${startMarker}[\\s\\S]*${endMarker}`),
      newContent
    );
    
    fs.writeFileSync(readmePath, readme);
    console.log('Standings updated successfully!');
  } catch (error) {
    console.error('Error updating standings:', error);
    process.exit(1);
  }
}

updateStandings();