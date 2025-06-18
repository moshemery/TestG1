var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const scoreboard = document.getElementById('scoreboard');
const scoreTable = document.getElementById('score-table');
const AIRTABLE_API_KEY = 'patipkX905rbyd9jI.5f1856e68ce599923e05fc3423c5f5d61805a64ae757bfdf0595e36267401da';
const AIRTABLE_BASE_ID = 'app2CnjHccmeNtrXz';
const AIRTABLE_TABLE_NAME = 'Game Scores';
function formatDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}
export function sendScoreToAirtable(finalScore, name) {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
        }
        catch (err) {
            console.error('Failed to send score to Airtable', err);
        }
    });
}
export function fetchTopScores() {
    return __awaiter(this, void 0, void 0, function* () {
        const params = `maxRecords=10&sort%5B0%5D%5Bfield%5D=Score&sort%5B0%5D%5Bdirection%5D=desc`;
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?${params}`;
        try {
            const res = yield fetch(url, {
                headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
            });
            const data = yield res.json();
            return data.records || [];
        }
        catch (err) {
            console.error('Failed to fetch scores from Airtable', err);
            return [];
        }
    });
}
export function fetchUserTopScore(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = `maxRecords=1&filterByFormula=${encodeURIComponent(`{Name}='${name}'`)}&sort%5B0%5D%5Bfield%5D=Score&sort%5B0%5D%5Bdirection%5D=desc`;
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?${params}`;
        try {
            const res = yield fetch(url, {
                headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
            });
            const data = yield res.json();
            if (data.records && data.records.length > 0) {
                return data.records[0].fields.Score || 0;
            }
        }
        catch (err) {
            console.error('Failed to fetch user top score from Airtable', err);
        }
        return 0;
    });
}
export function displayScores(records) {
    scoreTable.innerHTML = '<tr><th>Name</th><th>Score</th><th>Date of Play</th></tr>';
    records.forEach((r) => {
        const fields = r.fields;
        const row = document.createElement('tr');
        row.innerHTML = `<td>${fields.Name}</td><td>${fields.Score}</td><td>${fields['Date of Play']}</td>`;
        scoreTable.appendChild(row);
    });
    scoreboard.style.display = 'block';
}
