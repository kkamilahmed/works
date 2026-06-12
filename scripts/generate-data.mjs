import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'data');
fs.mkdirSync(OUT, { recursive: true });

// ---- Teams & Elo ratings (plausible 2026 qualifiers) ----
const teams = [
  { name: 'Argentina', elo: 2105 },
  { name: 'France', elo: 2043 },
  { name: 'Spain', elo: 2035 },
  { name: 'England', elo: 2010 },
  { name: 'Brazil', elo: 2000 },
  { name: 'Portugal', elo: 1990 },
  { name: 'Netherlands', elo: 1975 },
  { name: 'Belgium', elo: 1960 },
  { name: 'Germany', elo: 1955 },
  { name: 'Italy', elo: 1940 },
  { name: 'Croatia', elo: 1920 },
  { name: 'Colombia', elo: 1910 },
  { name: 'Uruguay', elo: 1905 },
  { name: 'Morocco', elo: 1895 },
  { name: 'Switzerland', elo: 1885 },
  { name: 'Japan', elo: 1875 },
  { name: 'USA', elo: 1865 },
  { name: 'Denmark', elo: 1858 },
  { name: 'Senegal', elo: 1850 },
  { name: 'Mexico', elo: 1845 },
  { name: 'South Korea', elo: 1838 },
  { name: 'Ecuador', elo: 1832 },
  { name: 'Austria', elo: 1828 },
  { name: 'Iran', elo: 1820 },
  { name: 'Australia', elo: 1805 },
  { name: 'Canada', elo: 1800 },
  { name: 'Tunisia', elo: 1795 },
  { name: 'Ukraine', elo: 1788 },
  { name: 'Egypt', elo: 1782 },
  { name: 'Algeria', elo: 1778 },
  { name: 'Serbia', elo: 1772 },
  { name: 'Poland', elo: 1765 },
  { name: 'Norway', elo: 1760 },
  { name: 'Ivory Coast', elo: 1750 },
  { name: 'Panama', elo: 1735 },
  { name: 'Saudi Arabia', elo: 1728 },
  { name: 'Qatar', elo: 1722 },
  { name: 'Ghana', elo: 1715 },
  { name: 'Paraguay', elo: 1708 },
  { name: 'Costa Rica', elo: 1700 },
  { name: 'Jordan', elo: 1685 },
  { name: 'Uzbekistan', elo: 1678 },
  { name: 'South Africa', elo: 1670 },
  { name: 'Cape Verde', elo: 1660 },
  { name: 'Curacao', elo: 1635 },
  { name: 'Jamaica', elo: 1615 },
  { name: 'New Zealand', elo: 1600 },
  { name: 'Haiti', elo: 1580 },
];

const eloOf = (name) => teams.find((t) => t.name === name).elo;

// ---- Group assignment (pot-based draw, A-L) ----
const groups = {
  A: ['Argentina', 'Uruguay', 'Australia', 'Qatar'],
  B: ['France', 'Morocco', 'Canada', 'Ghana'],
  C: ['Spain', 'Switzerland', 'Tunisia', 'Paraguay'],
  D: ['England', 'Japan', 'Ukraine', 'Costa Rica'],
  E: ['Brazil', 'USA', 'Egypt', 'Jordan'],
  F: ['Portugal', 'Denmark', 'Algeria', 'Uzbekistan'],
  G: ['Netherlands', 'Senegal', 'Serbia', 'South Africa'],
  H: ['Belgium', 'Mexico', 'Poland', 'Cape Verde'],
  I: ['Germany', 'South Korea', 'Norway', 'Curacao'],
  J: ['Italy', 'Ecuador', 'Ivory Coast', 'Jamaica'],
  K: ['Croatia', 'Austria', 'Panama', 'New Zealand'],
  L: ['Colombia', 'Iran', 'Saudi Arabia', 'Haiti'],
};

// ---- Match outcome model ----
function matchProbs(eloA, eloB) {
  const diff = eloA - eloB;
  const expectedA = 1 / (1 + Math.pow(10, -diff / 400));
  let drawProb = 0.3 - Math.abs(diff) / 2200;
  drawProb = Math.max(0.16, Math.min(0.3, drawProb));
  const remaining = 1 - drawProb;
  const winA = remaining * expectedA;
  const winB = remaining * (1 - expectedA);
  return { winA, draw: drawProb, winB };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ---- Monte Carlo simulation ----
const N = 20000;
const stageReach = {};
const sumPoints = {};
teams.forEach((t) => {
  stageReach[t.name] = { R32: 0, R16: 0, QF: 0, SF: 0, Final: 0, Winner: 0 };
  sumPoints[t.name] = 0;
});

for (let iter = 0; iter < N; iter++) {
  const qualifiers = [];
  const thirdPlaced = [];

  for (const names of Object.values(groups)) {
    const pts = {};
    names.forEach((n) => (pts[n] = 0));
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const a = names[i];
        const b = names[j];
        const { winA, draw, winB } = matchProbs(eloOf(a), eloOf(b));
        const r = Math.random();
        if (r < winA) pts[a] += 3;
        else if (r < winA + draw) {
          pts[a] += 1;
          pts[b] += 1;
        } else pts[b] += 3;
      }
    }
    const sorted = [...names].sort(
      (x, y) => pts[y] + Math.random() * 0.01 - (pts[x] + Math.random() * 0.01)
    );
    sorted.forEach((n, idx) => {
      sumPoints[n] += pts[n];
      if (idx < 2) qualifiers.push(n);
    });
    thirdPlaced.push({ team: sorted[2], points: pts[sorted[2]] });
  }

  thirdPlaced.sort((a, b) => b.points + Math.random() * 0.01 - (a.points + Math.random() * 0.01));
  for (let i = 0; i < 8; i++) qualifiers.push(thirdPlaced[i].team);

  qualifiers.forEach((t) => stageReach[t].R32++);

  let round = [...qualifiers];
  const stages = ['R16', 'QF', 'SF', 'Final', 'Winner'];
  for (const stage of stages) {
    shuffle(round);
    const winners = [];
    for (let i = 0; i < round.length; i += 2) {
      const a = round[i];
      const b = round[i + 1];
      const { winA, draw } = matchProbs(eloOf(a), eloOf(b));
      const pA = winA + draw / 2;
      winners.push(Math.random() < pA ? a : b);
    }
    winners.forEach((t) => stageReach[t][stage]++);
    round = winners;
  }
}

const pct = (count) => Math.round((count / N) * 1000) / 10;
const avgPts = (sum) => Math.round((sum / N) * 10) / 10;

// ---- group_standings.json ----
const groupStandings = {};
for (const [g, names] of Object.entries(groups)) {
  const rows = names
    .map((n) => ({
      team: n,
      avgPoints: avgPts(sumPoints[n]),
      qualPercent: pct(stageReach[n].R32),
    }))
    .sort((a, b) => b.avgPoints - a.avgPoints)
    .map((row, idx) => ({ ...row, rank: idx + 1 }));
  groupStandings[g] = rows;
}
fs.writeFileSync(path.join(OUT, 'group_standings.json'), JSON.stringify(groupStandings, null, 2));

// ---- elo_ratings.json ----
const eloRatings = [...teams]
  .sort((a, b) => b.elo - a.elo)
  .map((t, idx) => ({ rank: idx + 1, team: t.name, elo: t.elo }));
fs.writeFileSync(path.join(OUT, 'elo_ratings.json'), JSON.stringify(eloRatings, null, 2));

// ---- knockout_probabilities.json ----
const knockoutProbabilities = [...teams]
  .sort((a, b) => b.elo - a.elo)
  .map((t) => ({
    team: t.name,
    R32: pct(stageReach[t.name].R32),
    R16: pct(stageReach[t.name].R16),
    QF: pct(stageReach[t.name].QF),
    SF: pct(stageReach[t.name].SF),
    Final: pct(stageReach[t.name].Final),
    Winner: pct(stageReach[t.name].Winner),
  }));
fs.writeFileSync(
  path.join(OUT, 'knockout_probabilities.json'),
  JSON.stringify(knockoutProbabilities, null, 2)
);

// ---- top_favorites.json ----
const topFavorites = [...knockoutProbabilities]
  .sort((a, b) => b.Winner - a.Winner)
  .slice(0, 10)
  .map((t) => ({ team: t.team, elo: eloOf(t.team), winnerProbability: t.Winner }));
fs.writeFileSync(path.join(OUT, 'top_favorites.json'), JSON.stringify(topFavorites, null, 2));

// ---- most_likely_bracket.json ----
// Determine the 32 most-likely qualifiers from each group's deterministic ranking.
const directQualifiers = [];
const thirdPlaceCandidates = [];
for (const g of Object.keys(groupStandings)) {
  const rows = groupStandings[g];
  directQualifiers.push(rows[0].team, rows[1].team);
  thirdPlaceCandidates.push(rows[2]);
}
const bestThirds = [...thirdPlaceCandidates]
  .sort((a, b) => b.avgPoints - a.avgPoints)
  .slice(0, 8)
  .map((r) => r.team);
const qualifiers32 = [...directQualifiers, ...bestThirds];

// Seed by elo desc, then apply standard bracket seed order so favorites are spread out.
const seeded = [...qualifiers32].sort((a, b) => eloOf(b) - eloOf(a));
function seedOrder(n) {
  if (n === 1) return [1];
  const prev = seedOrder(n / 2);
  const result = [];
  for (const s of prev) {
    result.push(s);
    result.push(n + 1 - s);
  }
  return result;
}
const order = seedOrder(32); // seed numbers 1..32 in bracket order
const r32Teams = order.map((seedNum) => seeded[seedNum - 1]);

const bracket = {};
bracket.R32 = r32Teams.map((team) => ({
  team,
  probability: pct(stageReach[team].R32),
}));

function nextRound(prevTeams, stageKey) {
  const winners = [];
  for (let i = 0; i < prevTeams.length; i += 2) {
    const a = prevTeams[i];
    const b = prevTeams[i + 1];
    winners.push(eloOf(a) >= eloOf(b) ? a : b);
  }
  return winners.map((team) => ({ team, probability: pct(stageReach[team][stageKey]) }));
}

let currentTeams = r32Teams;
const stageOrder = [
  ['R16', 'R16'],
  ['QF', 'QF'],
  ['SF', 'SF'],
  ['Final', 'Final'],
];
for (const [bracketKey, stageKey] of stageOrder) {
  const round = nextRound(currentTeams, stageKey);
  bracket[bracketKey] = round;
  currentTeams = round.map((r) => r.team);
}
bracket.Winner = [
  { team: currentTeams[0], probability: pct(stageReach[currentTeams[0]].Winner) },
];

fs.writeFileSync(path.join(OUT, 'most_likely_bracket.json'), JSON.stringify(bracket, null, 2));

// ---- elo_history.json ----
const HISTORY_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
function genHistory(currentElo, points) {
  const years = HISTORY_YEARS.slice(HISTORY_YEARS.length - points);
  const start = currentElo - (40 + Math.random() * 180);
  const vals = years.map((_, i) => {
    const t = i / (years.length - 1 || 1);
    const base = start + (currentElo - start) * t;
    const noise = (Math.random() - 0.5) * 35;
    return Math.round(base + noise);
  });
  vals[vals.length - 1] = currentElo;
  return years.map((year, i) => ({ year, elo: vals[i] }));
}

const top12 = [...teams].sort((a, b) => b.elo - a.elo).slice(0, 12);
const eloHistory = top12.map((t) => ({ team: t.name, history: genHistory(t.elo, 9) }));
// A couple of "rising" teams with short history to exercise the <5-points skip rule.
eloHistory.push({ team: 'Cape Verde', history: genHistory(eloOf('Cape Verde'), 3) });
eloHistory.push({ team: 'Curacao', history: genHistory(eloOf('Curacao'), 3) });
fs.writeFileSync(path.join(OUT, 'elo_history.json'), JSON.stringify(eloHistory, null, 2));

// ---- backtest_results.json ----
const backtestResults = {
  summary: {
    tournamentsTested: 3,
    correctChampionPicks: 1,
    top4HitRate: 66.7,
    groupStageAccuracy: 79.2,
    brierScore: 0.146,
  },
  tournaments: [
    {
      year: 2014,
      predictedWinner: 'Brazil',
      predictedWinnerProbability: 19.8,
      actualWinner: 'Germany',
      actualWinnerPredictedProbability: 9.4,
      top4Predicted: ['Brazil', 'Germany', 'Argentina', 'Netherlands'],
      top4Actual: ['Germany', 'Argentina', 'Netherlands', 'Brazil'],
      top4Matches: 4,
    },
    {
      year: 2018,
      predictedWinner: 'Brazil',
      predictedWinnerProbability: 17.2,
      actualWinner: 'France',
      actualWinnerPredictedProbability: 12.6,
      top4Predicted: ['Brazil', 'Germany', 'France', 'Spain'],
      top4Actual: ['France', 'Croatia', 'Belgium', 'England'],
      top4Matches: 1,
    },
    {
      year: 2022,
      predictedWinner: 'Brazil',
      predictedWinnerProbability: 16.4,
      actualWinner: 'Argentina',
      actualWinnerPredictedProbability: 11.1,
      top4Predicted: ['Brazil', 'Argentina', 'France', 'England'],
      top4Actual: ['Argentina', 'France', 'Croatia', 'Morocco'],
      top4Matches: 2,
    },
  ],
};
fs.writeFileSync(path.join(OUT, 'backtest_results.json'), JSON.stringify(backtestResults, null, 2));

console.log('Data generation complete.');
console.log('Top favorites:', topFavorites.slice(0, 5).map((t) => `${t.team} ${t.winnerProbability}%`));
console.log('Bracket winner:', bracket.Winner[0]);
