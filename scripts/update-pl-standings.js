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

function getColor(position) {
  if (position === 1) return '🟢'; // Champions
  if (position >= 2 && position <= 4) return '🟦'; // Champions League
  if (position === 5) return '🟨'; // Europa League
  if (position >= 18) return '🔴'; // Relegation
  return '⚪'; // Mid table
}

function generateMarkdownTable(standings) {
  const header = '| Pos |  Club  | P | W | D | L | GD | Pts |\n|-----|------|----|---|---|---|----|----|';
  const rows = standings.map(team => {
    const statusColor = getColor(team.position);
    return `|  ${statusColor} ${team.position} | <img src="${team.team.crest}" alt="${team.team.name}" width="20" height="20"> ${team.team.name} | ${team.playedGames} | ${team.won} | ${team.draw} | ${team.lost} | ${team.goalDifference} | ${team.points} |`;
  });
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
