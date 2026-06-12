import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'data');

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('Usage: node scripts/transform-data.mjs <source-data-dir>');
  process.exit(1);
}

const readJSON = (name) => JSON.parse(fs.readFileSync(path.join(srcDir, name), 'utf-8'));
const writeJSON = (name, data) => {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote ${name}`);
};

// elo_ratings.json: already [{ team, elo }]
writeJSON('elo_ratings.json', readJSON('elo_ratings.json'));

// group_standings.json: "Group A" -> "A", add rank from sort order, rename fields
const groupStandingsRaw = readJSON('group_standings.json');
const groupStandings = {};
for (const [key, rows] of Object.entries(groupStandingsRaw)) {
  const letter = key.replace(/^Group\s+/, '');
  groupStandings[letter] = rows.map((row, i) => ({
    team: row.team,
    rank: i + 1,
    avgPoints: row.avg_points,
    qualPercent: row.qualification_prob,
  }));
}
writeJSON('group_standings.json', groupStandings);

// knockout_probabilities.json: pivot stage-keyed -> team-keyed
const STAGES = ['R32', 'R16', 'QF', 'SF', 'Final', 'Winner'];
const koRaw = readJSON('knockout_probabilities.json');
const byTeam = new Map();
for (const stage of STAGES) {
  for (const { team, probability } of koRaw[stage] ?? []) {
    if (!byTeam.has(team)) byTeam.set(team, { team });
    byTeam.get(team)[stage] = probability;
  }
}
const knockout = [...byTeam.values()].map((t) => {
  for (const stage of STAGES) {
    if (t[stage] === undefined) t[stage] = 0;
  }
  return t;
});
writeJSON('knockout_probabilities.json', knockout);

// elo_history.json: { team: [{date, elo}] } -> [{ team, history: [{year, elo}] }], one point per year
const historyRaw = readJSON('elo_history.json');
const eloHistory = Object.entries(historyRaw).map(([team, points]) => {
  const byYear = new Map();
  for (const { date, elo } of points) {
    byYear.set(Number(date.slice(0, 4)), elo); // dates are ascending, so last write per year wins
  }
  const history = [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, elo]) => ({ year, elo }));
  return { team, history };
});
writeJSON('elo_history.json', eloHistory);

// top_favorites.json / backtest_results.json: copy as-is
writeJSON('top_favorites.json', readJSON('top_favorites.json'));
writeJSON('backtest_results.json', readJSON('backtest_results.json'));
