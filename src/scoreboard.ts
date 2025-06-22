import { vrMode } from './config.js';

export const scoreboard = document.getElementById('scoreboard') as HTMLDivElement;
const scoreTable = document.getElementById('score-table') as HTMLTableElement;

export let scoreboardRight: HTMLDivElement | null = null;
let scoreTableRight: HTMLTableElement | null = null;

if (vrMode) {
  scoreboard.style.left = '25%';
  scoreboardRight = scoreboard.cloneNode(true) as HTMLDivElement;
  scoreboardRight.id = 'scoreboard-right';
  scoreboardRight.style.left = '75%';
  document.body.appendChild(scoreboardRight);
  scoreTableRight = scoreboardRight.querySelector('table') as HTMLTableElement;
  if (scoreTableRight) {
    scoreTableRight.id = 'score-table-right';
  }
}

const AIRTABLE_API_KEY =
  'patipkX905rbyd9jI.5f1856e68ce599923e05fc3423c5f5d61805a64ae757bfdf0595e36267f401da';
const AIRTABLE_BASE_ID = 'app2CnjHccmeNtrXz';
const AIRTABLE_TABLE_NAME = 'Game Scores';

function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export async function sendScoreToAirtable(finalScore: number, name: string | null) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
  const body = {
    records: [
      {
        fields: {
          Score: finalScore,
          Name: name || 'Anonymous',
          'Date of Play': formatDate(new Date()),
        },
      },
    ],
  };
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('Failed to send score to Airtable', err);
  }
}

export async function fetchTopScores() {
  const params = `maxRecords=10&sort%5B0%5D%5Bfield%5D=Score&sort%5B0%5D%5Bdirection%5D=desc`;
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?${params}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    const data = await res.json();
    return data.records || [];
  } catch (err) {
    console.error('Failed to fetch scores from Airtable', err);
    return [];
  }
}

export async function fetchUserTopScore(name: string): Promise<number> {
  const params = `maxRecords=1&filterByFormula=${encodeURIComponent(`{Name}='${name}'`)}&sort%5B0%5D%5Bfield%5D=Score&sort%5B0%5D%5Bdirection%5D=desc`;
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?${params}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    const data = await res.json();
    if (data.records && data.records.length > 0) {
      return data.records[0].fields.Score || 0;
    }
  } catch (err) {
    console.error('Failed to fetch user top score from Airtable', err);
  }
  return 0;
}

export function displayScores(records: any[]) {
  const populate = (table: HTMLTableElement | null) => {
    if (!table) return;
    table.innerHTML = '<tr><th>Name</th><th>Score</th><th>Date of Play</th></tr>';
    records.forEach((r: any) => {
      const fields = r.fields;
      const row = document.createElement('tr');
      row.innerHTML = `<td>${fields.Name}</td><td>${fields.Score}</td><td>${fields['Date of Play']}</td>`;
      table.appendChild(row);
    });
  };

  populate(scoreTable);
  populate(scoreTableRight);

  scoreboard.style.display = 'block';
  if (scoreboardRight) scoreboardRight.style.display = 'block';
}
