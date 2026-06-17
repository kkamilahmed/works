import { useEffect, useRef, useState } from 'react';
import { TitleSlideContent } from './Slide1Title';
import Slide2Groups from './Slide2Groups';
import Slide3Elo from './Slide3Elo';
import Slide4Bracket from './Slide4Bracket';

// ── VS Code Dark+ token colours ───────────────────────────────────────────────
const K = '#569cd6'; // keywords
const C = '#6a9955'; // comments
const S = '#ce9178'; // strings
const N = '#b5cea8'; // numbers
const F = '#dcdcaa'; // functions
const D = '#d4d4d4'; // default

// ── Notebook cell code ────────────────────────────────────────────────────────

const IMPORTS_LINES = [
  [[K, 'import'], [D, ' pandas '], [K, 'as'], [D, ' pd']],
  [[K, 'import'], [D, ' numpy '], [K, 'as'], [D, ' np']],
  [[K, 'import'], [D, ' xgboost '], [K, 'as'], [D, ' xgb']],
  [[K, 'import'], [D, ' plotly.express '], [K, 'as'], [D, ' px']],
  [[K, 'import'], [D, ' plotly.graph_objects '], [K, 'as'], [D, ' go']],
  [[K, 'from'], [D, ' collections '], [K, 'import'], [D, ' '], [F, 'defaultdict']],
  [[K, 'from'], [D, ' itertools '], [K, 'import'], [D, ' combinations']],
  [[K, 'from'], [D, ' sklearn.model_selection '], [K, 'import'], [D, ' '], [F, 'train_test_split']],
  [[K, 'from'], [D, ' sklearn.metrics '], [K, 'import'], [D, ' '], [F, 'brier_score_loss']],
  [],
  [[D, 'np.random.'], [F, 'seed'], [D, '('], [N, '42'], [D, ')']],
  [[F, 'print'], [D, '('], [S, "'✅ Libraries loaded'"], [D, ')']],
];

const DATA_LINES = [
  [[D, 'GITHUB_URL = (']],
  [[D, '    '], [S, "'https://raw.githubusercontent.com/'"]],
  [[D, '    '], [S, "'martj42/international-results/master/results.csv'"]],
  [[D, ')']],
  [],
  [[D, 'df_raw = pd.'], [F, 'read_csv'], [D, '(GITHUB_URL, parse_dates=['], [S, "'date'"], [D, '])']],
  [[D, "df_raw["], [S, "'goal_diff'"], [D, '] = (']],
  [[D, "    df_raw["], [S, "'home_score'"], [D, '] - df_raw['], [S, "'away_score'"], [D, ']).'], [F, 'abs'], [D, '()']],
  [],
  [[F, 'print'], [D, '('], [S, "f'✅ Loaded {len(df_raw):,} matches'"], [D, ')']],
  [[F, 'print'], [D, '('], [S, "f'   Period : {df_raw[\"date\"].min().year}–{df_raw[\"date\"].max().year}'"], [D, ')']],
  [[F, 'print'], [D, '('], [S, "f'   Shape  : {df_raw.shape}'"], [D, ')']],
];

const PREP_LINES = [
  [[C, '# Filter to post-2010 (stronger Elo signal)']],
  [[D, 'df = df_raw[df_raw['], [S, "'date'"], [D, '] >= '], [S, "'2010-01-01'"], [D, '].'], [F, 'copy'], [D, '()']],
  [],
  [[D, 'NAME_MAP = {']],
  [[D, '    '], [S, "'Korea Republic'"], [D, ':  '], [S, "'South Korea'"], [D, ',']],
  [[D, '    '], [S, "'China PR'"], [D, ':         '], [S, "'China'"], [D, ',']],
  [[D, '    '], [S, "'IR Iran'"], [D, ':          '], [S, "'Iran'"], [D, ',']],
  [[D, '    '], [S, "'Türkiye'"], [D, ':          '], [S, "'Turkey'"], [D, ',']],
  [[D, '}']],
  [[D, "df["], [S, "'home_team'"], [D, '] = df['], [S, "'home_team'"], [D, '].'], [F, 'replace'], [D, '(NAME_MAP)']],
  [[D, "df["], [S, "'away_team'"], [D, '] = df['], [S, "'away_team'"], [D, '].'], [F, 'replace'], [D, '(NAME_MAP)']],
  [],
  [[F, 'print'], [D, '('], [S, "f'✅ {len(df):,} matches retained · {len(NAME_MAP)} aliases applied'"], [D, ')']],
];

const WEIGHT_LINES = [
  [[D, 'WEIGHTS = {']],
  [[D, '    '], [S, "'FIFA World Cup'"], [D, ':       '], [N, '4.0'], [D, ',']],
  [[D, '    '], [S, "'UEFA Euro'"], [D, ':            '], [N, '3.0'], [D, ',']],
  [[D, '    '], [S, "'Copa America'"], [D, ':         '], [N, '3.0'], [D, ',']],
  [[D, '    '], [S, "'AFC Asian Cup'"], [D, ':        '], [N, '2.5'], [D, ',']],
  [[D, '    '], [S, "'World Cup qualifier'"], [D, ':  '], [N, '2.0'], [D, ',']],
  [[D, '    '], [S, "'friendly'"], [D, ':             '], [N, '0.5'], [D, ',']],
  [[D, '}']],
  [],
  [[K, 'def'], [D, ' '], [F, 'tourney_weight'], [D, '(name):']],
  [[D, '    '], [K, 'for'], [D, ' key, w '], [K, 'in'], [D, ' WEIGHTS.'], [F, 'items'], [D, '():']],
  [[D, '        '], [K, 'if'], [D, ' key.'], [F, 'lower'], [D, '() '], [K, 'in'], [D, ' name.'], [F, 'lower'], [D, '():']],
  [[D, '            '], [K, 'return'], [D, ' w']],
  [[D, '    '], [K, 'return'], [D, ' '], [N, '1.0']],
  [],
  [[D, "df["], [S, "'weight'"], [D, '] = df['], [S, "'tournament'"], [D, '].'], [F, 'apply'], [D, '(tourney_weight)']],
];

const FEAT_LINES = [
  [[K, 'def'], [D, ' '], [F, 'expected_score'], [D, '(elo_a, elo_b, home_adv='], [N, '0'], [D, '):']],
  [[D, '    diff = elo_a - elo_b + home_adv']],
  [[D, '    '], [K, 'return'], [D, ' '], [N, '1'], [D, ' / ('], [N, '1'], [D, ' + '], [N, '10'], [D, ' ** (-diff / '], [N, '400'], [D, '))']],
  [],
  [[K, 'def'], [D, ' '], [F, 'k_factor'], [D, '(weight, goal_diff):']],
  [[D, '    base = '], [N, '20'], [D, ' * weight']],
  [[D, '    mult = ('], [N, '1.0'], [D, '  '], [K, 'if'], [D, ' goal_diff <= '], [N, '1']],
  [[D, '             '], [K, 'else'], [D, ' '], [N, '1.5'], [D, ' '], [K, 'if'], [D, ' goal_diff == '], [N, '2']],
  [[D, '             '], [K, 'else'], [D, ' '], [N, '1.75'], [D, ' + (goal_diff - '], [N, '3'], [D, ') * '], [N, '0.25'], [D, ')']],
  [[D, '    '], [K, 'return'], [D, ' base * mult']],
  [],
  [[D, 'HOME_ADV   = '], [N, '50']],
  [[D, 'HOST_BONUS = '], [N, '100']],
  [[D, 'HOSTS      = {'], [S, '"USA"'], [D, ', '], [S, '"Canada"'], [D, ', '], [S, '"Mexico"'], [D, '}']],
];

const ELO_LINES = [
  [[D, 'INITIAL_ELO = '], [N, '1500']],
  [[D, 'elo_ratings = '], [F, 'defaultdict'], [D, '('], [K, 'lambda'], [D, ': INITIAL_ELO)']],
  [],
  [[K, 'for'], [D, ' _, row '], [K, 'in'], [D, ' df.'], [F, 'sort_values'], [D, '('], [S, "'date'"], [D, ').'], [F, 'iterrows'], [D, '():']],
  [[D, '    home, away = row['], [S, "'home_team'"], [D, '], row['], [S, "'away_team'"], [D, ']']],
  [[D, '    h_adv = HOME_ADV + (HOST_BONUS '], [K, 'if'], [D, ' home '], [K, 'in'], [D, ' HOSTS '], [K, 'else'], [D, ' '], [N, '0'], [D, ')']],
  [],
  [[D, '    exp_h = '], [F, 'expected_score'], [D, '(']],
  [[D, '        elo_ratings[home], elo_ratings[away], h_adv)']],
  [],
  [[D, '    hs, as_ = row['], [S, "'home_score'"], [D, '], row['], [S, "'away_score'"], [D, ']']],
  [[D, '    act_h = ('], [N, '1'], [D, ' '], [K, 'if'], [D, ' hs > as_ '], [K, 'else'], [D, ' '], [N, '0.5'], [D, ' '], [K, 'if'], [D, ' hs==as_ '], [K, 'else'], [D, ' '], [N, '0'], [D, ')']],
  [[D, '    k     = '], [F, 'k_factor'], [D, '(row['], [S, "'weight'"], [D, '], '], [F, 'abs'], [D, '(hs - as_))']],
  [],
  [[D, '    elo_ratings[home] += k * (act_h - exp_h)']],
  [[D, '    elo_ratings[away] += k * (('], [N, '1'], [D, ' - act_h) - ('], [N, '1'], [D, ' - exp_h))']],
];

const VIZ_LINES = [
  [[D, 'top10 = '], [F, 'sorted'], [D, '(elo_ratings, key=elo_ratings.'], [F, 'get'], [D, ', reverse='], [K, 'True'], [D, ')[:'], [N, '10'], [D, ']']],
  [[D, 'elo_df = pd.'], [F, 'DataFrame'], [D, '({']],
  [[D, '    '], [S, "'team'"], [D, ': top10,']],
  [[D, '    '], [S, "'elo'"], [D, ':  [elo_ratings[t] '], [K, 'for'], [D, ' t '], [K, 'in'], [D, ' top10],']],
  [[D, '})']],
  [],
  [[D, 'fig = px.'], [F, 'bar'], [D, '(elo_df, x='], [S, "'elo'"], [D, ', y='], [S, "'team'"], [D, ',']],
  [[D, '            orientation='], [S, "'h'"], [D, ', title='], [S, "'Top 10 Elo Ratings'"], [D, ',']],
  [[D, '            template='], [S, "'plotly_dark'"], [D, ')']],
  [[D, 'fig.'], [F, 'show'], [D, '()']],
];

const BACKTEST_LINES = [
  [[D, 'WC2022_GROUPS = {']],
  [[D, '    '], [S, "'A'"], [D, ': ['], [S, "'Qatar'"], [D, ', '], [S, "'Ecuador'"], [D, ', '], [S, "'Senegal'"], [D, ', '], [S, "'Netherlands'"], [D, '],']],
  [[D, '    '], [S, "'B'"], [D, ': ['], [S, "'England'"], [D, ', '], [S, "'USA'"], [D, ', '], [S, "'Iran'"], [D, ', '], [S, "'Wales'"], [D, '],']],
  [[C, '    # … Groups C–H']],
  [[D, '}']],
  [],
  [[D, 'snap_2022 = '], [F, 'elo_snapshot'], [D, '(cutoff='], [S, "'2022-11-20'"], [D, ')']],
  [[D, 'probs_22  = '], [F, 'simulate_full_tournament'], [D, '(']],
  [[D, '    WC2022_GROUPS, snap_2022, n_sims='], [N, '50_000'], [D, ')']],
  [],
  [[D, 'top4_pred   = '], [F, 'sorted'], [D, '(probs_22,']],
  [[D, '    key='], [K, 'lambda'], [D, ' t: probs_22[t]['], [S, "'SF'"], [D, '], reverse='], [K, 'True'], [D, ')[:'], [N, '4'], [D, ']']],
  [[D, 'top4_actual = ['], [S, "'Argentina'"], [D, ', '], [S, "'France'"], [D, ', '], [S, "'Croatia'"], [D, ', '], [S, "'Morocco'"], [D, ']']],
  [[F, 'print'], [D, '('], [S, "f'Top-4 overlap: {len(set(top4_pred)&set(top4_actual))}/4'"], [D, ')']],
];

const DRAW_LINES = [
  [[D, 'WC2026_GROUPS = {']],
  [[D, '    '], [S, "'A'"], [D, ': ['], [S, "'Mexico'"], [D, ', '], [S, "'USA'"], [D, ', '], [S, "'Uruguay'"], [D, ', '], [S, "'Guinea'"], [D, '],']],
  [[D, '    '], [S, "'B'"], [D, ': ['], [S, "'Argentina'"], [D, ', '], [S, "'Chile'"], [D, ', '], [S, "'Peru'"], [D, ', '], [S, "'Canada'"], [D, '],']],
  [[D, '    '], [S, "'C'"], [D, ': ['], [S, "'Brazil'"], [D, ', '], [S, "'Colombia'"], [D, ', '], [S, "'Ecuador'"], [D, ', '], [S, "'Jamaica'"], [D, '],']],
  [[D, '    '], [S, "'D'"], [D, ': ['], [S, "'France'"], [D, ', '], [S, "'England'"], [D, ', '], [S, "'Morocco'"], [D, ', '], [S, "'Algeria'"], [D, '],']],
  [[D, '    '], [S, "'E'"], [D, ': ['], [S, "'Spain'"], [D, ', '], [S, "'Germany'"], [D, ', '], [S, "'Belgium'"], [D, ', '], [S, "'Senegal'"], [D, '],']],
  [[C, '    # … Groups F–L · 48 teams total']],
  [[D, '}']],
  [],
  [[D, 'n_teams = '], [F, 'sum'], [D, '('], [F, 'len'], [D, '(v) '], [K, 'for'], [D, ' v '], [K, 'in'], [D, ' WC2026_GROUPS.'], [F, 'values'], [D, '())']],
  [[F, 'print'], [D, '('], [S, "f'✅ {n_teams} teams across {len(WC2026_GROUPS)} groups'"], [D, ')']],
];

const MC_LINES = [
  [[K, 'def'], [D, ' '], [F, 'sim_match'], [D, '(elo_a, elo_b):']],
  [[D, '    p = '], [F, 'expected_score'], [D, '(elo_a, elo_b)']],
  [[D, '    r = np.random.'], [F, 'random'], [D, '()']],
  [[D, '    '], [K, 'return'], [D, ' ('], [N, '1'], [D, ', '], [N, '0'], [D, ') '], [K, 'if'], [D, ' r < p '], [K, 'else'], [D, ' ('], [N, '0'], [D, ', '], [N, '1'], [D, ')']],
  [],
  [[K, 'def'], [D, ' '], [F, 'sim_group'], [D, '(teams, elo):']],
  [[D, '    pts = '], [F, 'defaultdict'], [D, '('], [F, 'int'], [D, ')']],
  [[D, '    '], [K, 'for'], [D, ' a, b '], [K, 'in'], [D, ' '], [F, 'combinations'], [D, '(teams, '], [N, '2'], [D, '):']],
  [[D, '        wa, wb = '], [F, 'sim_match'], [D, '(elo[a], elo[b])']],
  [[D, '        pts[a] += wa * '], [N, '3'], [D, ';  pts[b] += wb * '], [N, '3']],
  [[D, '    '], [K, 'return'], [D, ' '], [F, 'sorted'], [D, '(teams, key='], [K, 'lambda'], [D, ' t: pts[t], reverse='], [K, 'True'], [D, ')']],
  [],
  [[K, 'def'], [D, ' '], [F, 'sim_knockout'], [D, '(bracket, elo):']],
  [[D, '    '], [K, 'while'], [D, ' '], [F, 'len'], [D, '(bracket) > '], [N, '1'], [D, ':']],
  [[D, '        winners = []']],
  [[D, '        '], [K, 'for'], [D, ' i '], [K, 'in'], [D, ' '], [F, 'range'], [D, '('], [N, '0'], [D, ', '], [F, 'len'], [D, '(bracket), '], [N, '2'], [D, '):']],
  [[D, '            w, _ = '], [F, 'sim_match'], [D, '(elo[bracket[i]], elo[bracket[i+'], [N, '1'], [D, ']])']],
  [[D, '            winners.'], [F, 'append'], [D, '(bracket[i] '], [K, 'if'], [D, ' w '], [K, 'else'], [D, ' bracket[i+'], [N, '1'], [D, '])']],
  [[D, '        bracket = winners']],
  [[D, '    '], [K, 'return'], [D, ' bracket['], [N, '0'], [D, ']']],
];

const GROUPS_SIM_LINES = [
  [[D, 'N_SIMS      = '], [N, '50_000']],
  [[D, 'qual_counts = '], [F, 'defaultdict'], [D, '('], [F, 'int'], [D, ')']],
  [[D, 'pts_totals  = '], [F, 'defaultdict'], [D, '('], [F, 'float'], [D, ')']],
  [],
  [[K, 'for'], [D, ' _ '], [K, 'in'], [D, ' '], [F, 'range'], [D, '(N_SIMS):']],
  [[D, '    '], [K, 'for'], [D, ' grp, teams '], [K, 'in'], [D, ' WC2026_GROUPS.'], [F, 'items'], [D, '():']],
  [[D, '        ranked = '], [F, 'sim_group'], [D, '(teams, elo_ratings)']],
  [[D, '        '], [K, 'for'], [D, ' i, t '], [K, 'in'], [D, ' '], [F, 'enumerate'], [D, '(ranked):']],
  [[D, '            qual_counts[t] += (i < '], [N, '2'], [D, ')']],
  [[D, '            pts_totals[t]  += ('], [N, '3'], [D, ' - i * '], [N, '0.5'], [D, ')']],
  [],
  [[D, 'qual_probs = {t: qual_counts[t]/N_SIMS '], [K, 'for'], [D, ' t '], [K, 'in'], [D, ' qual_counts}']],
  [[D, 'avg_pts    = {t: pts_totals[t]/N_SIMS  '], [K, 'for'], [D, ' t '], [K, 'in'], [D, ' pts_totals}']],
];

const THIRD_LINES = [
  [[C, '# Best-8 of 12 third-place teams qualify for R32']],
  [[D, 'third_place = []']],
  [[K, 'for'], [D, ' grp, teams '], [K, 'in'], [D, ' WC2026_GROUPS.'], [F, 'items'], [D, '():']],
  [[D, '    t3 = '], [F, 'sorted'], [D, '(teams, key='], [K, 'lambda'], [D, ' t: avg_pts[t], reverse='], [K, 'True'], [D, ')['], [N, '2'], [D, ']']],
  [[D, '    third_place.'], [F, 'append'], [D, '((t3, avg_pts[t3]))']],
  [],
  [[D, 'third_place.'], [F, 'sort'], [D, '(key='], [K, 'lambda'], [D, ' x: x['], [N, '1'], [D, '], reverse='], [K, 'True'], [D, ')']],
  [[D, 'qualifiers_r32 = (']],
  [[D, '    group_1st + group_2nd']],
  [[D, '    + [t '], [K, 'for'], [D, ' t, _ '], [K, 'in'], [D, ' third_place[:'], [N, '8'], [D, ']]']],
  [[D, ')']],
  [[F, 'print'], [D, '('], [S, "f'✅ R32 field: {len(qualifiers_r32)} teams confirmed'"], [D, ')']],
];

const KNOCKOUT_LINES = [
  [[D, 'round_probs = '], [F, 'defaultdict'], [D, '('], [K, 'lambda'], [D, ': '], [F, 'defaultdict'], [D, '('], [F, 'int'], [D, '))']],
  [],
  [[K, 'for'], [D, ' _ '], [K, 'in'], [D, ' '], [F, 'range'], [D, '(N_SIMS):']],
  [[D, '    bracket = '], [F, 'build_bracket'], [D, '(qualifiers_r32)']],
  [[K, 'for'], [D, ' rnd '], [K, 'in'], [D, ' ['], [S, "'R32'"], [D, ', '], [S, "'R16'"], [D, ', '], [S, "'QF'"], [D, ', '], [S, "'SF'"], [D, ', '], [S, "'Final'"], [D, ']:']],
  [[D, '        next_bracket = []']],
  [[D, '        '], [K, 'for'], [D, ' i '], [K, 'in'], [D, ' '], [F, 'range'], [D, '('], [N, '0'], [D, ', '], [F, 'len'], [D, '(bracket), '], [N, '2'], [D, '):']],
  [[D, '            w, _ = '], [F, 'sim_match'], [D, '(elo[bracket[i]], elo[bracket[i+'], [N, '1'], [D, ']])']],
  [[D, '            winner = bracket[i] '], [K, 'if'], [D, ' w '], [K, 'else'], [D, ' bracket[i+'], [N, '1'], [D, ']']],
  [[D, '            round_probs[winner][rnd] += '], [N, '1']],
  [[D, '            next_bracket.'], [F, 'append'], [D, '(winner)']],
  [[D, '        bracket = next_bracket']],
  [[D, '    round_probs[bracket['], [N, '0'], [D, ']]['], [S, "'Winner'"], [D, '] += '], [N, '1']],
];

const EXPORT_LINES = [
  [[K, 'import'], [D, ' json, pathlib']],
  [],
  [[D, 'OUT = pathlib.'], [F, 'Path'], [D, '('], [S, "'data'"], [D, ')']],
  [[D, 'OUT.'], [F, 'mkdir'], [D, '(exist_ok='], [K, 'True'], [D, ')']],
  [],
  [[D, 'exports = {']],
  [[D, '    '], [S, "'elo_ratings'"], [D, ':           elo_table,']],
  [[D, '    '], [S, "'group_standings'"], [D, ':        standings_table,']],
  [[D, '    '], [S, "'knockout_probabilities'"], [D, ':  ko_table,']],
  [[D, '    '], [S, "'top_favorites'"], [D, ':          favorites_table,']],
  [[D, '}']],
  [],
  [[K, 'for'], [D, ' name, data '], [K, 'in'], [D, ' exports.'], [F, 'items'], [D, '():']],
  [[D, '    (OUT / '], [S, "f'{name}.json'"], [D, ').'], [F, 'write_text'], [D, '(']],
  [[D, '        json.'], [F, 'dumps'], [D, '(data, indent='], [N, '2'], [D, '))']],
  [[F, 'print'], [D, '('], [S, "'✅ Exported 4 JSON files → data/'"], [D, ')']],
];

// ── Preview order: elo → groups → bracket ─────────────────────────────────────
const PREVIEW_SLIDES = [Slide3Elo, Slide2Groups, Slide4Bracket];

// ── Phases ────────────────────────────────────────────────────────────────────
const PHASES = [
  'video',       // screen recording plays full-width
  'title-card',  // "here's what bob built" card
  'split',       // notebook slides in, preview fades in
  'touring',     // cycles elo → groups → bracket
  'expanding',   // notebook collapses, bracket fills full width
  'crossfade',   // title overlay fades in
  'done',
];

// ── Small helpers ─────────────────────────────────────────────────────────────

function Tokens({ tokens }) {
  if (!tokens || tokens.length === 0) return <span>&nbsp;</span>;
  return tokens.map(([color, text], i) => (
    <span key={i} style={{ color }}>{text}</span>
  ));
}

function NbMd({ active, children }) {
  return (
    <div className={`nb-cell nb-cell--md${active ? ' nb-cell--active' : ''}`}>
      <div className="nb-cell__label" />
      <div className="nb-cell__content">{children}</div>
    </div>
  );
}

function NbCode({ n, lines, active }) {
  return (
    <div className={`nb-cell nb-cell--code${active ? ' nb-cell--active' : ''}`}>
      <div className="nb-cell__label">In&nbsp;[{n}]:</div>
      <div className="nb-cell__content">
        {lines.map((tokens, i) => (
          <div key={i} className="nb-line"><Tokens tokens={tokens} /></div>
        ))}
      </div>
    </div>
  );
}

function NbOut({ n, children }) {
  return (
    <div className="nb-cell nb-cell--out">
      <div className="nb-cell__label">Out&nbsp;[{n}]:</div>
      <div className="nb-cell__content">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Slide0Chat({ onAdvanceInstant }) {
  const [phase, setPhase] = useState('video');
  const [notebookSection, setNotebookSection] = useState(-1);
  const [overlayActive, setOverlayActive] = useState(false);

  const videoRef  = useRef(null);
  const nbBodyRef = useRef(null);
  const sec0Ref   = useRef(null);
  const sec1Ref   = useRef(null);
  const sec2Ref   = useRef(null);
  const sectionRefs = [sec0Ref, sec1Ref, sec2Ref];

  const phaseIdx    = PHASES.indexOf(phase);
  const isAfter     = (p) => phaseIdx >= PHASES.indexOf(p);
  const isSplit     = isAfter('split');
  const isExpanding = isAfter('expanding');

  // Scroll notebook to the active section
  useEffect(() => {
    if (notebookSection < 0) return;
    const nbEl  = nbBodyRef.current;
    const secEl = sectionRefs[notebookSection]?.current;
    if (nbEl && secEl) {
      nbEl.scrollTo({ top: secEl.offsetTop - 16, behavior: 'smooth' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookSection]);

  // ── Phase effects ─────────────────────────────────────────────────────────

  // After split opens, automatically show the first slide (Elo)
  useEffect(() => {
    if (phase !== 'split') return;
    const t = setTimeout(() => {
      setNotebookSection(0);
      setPhase('touring');
    }, 800);
    return () => clearTimeout(t);
  }, [phase]);

  // Arrow right advances internal animation steps; capture phase prevents App
  // from simultaneously advancing the slide deck while we still have steps left
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== 'ArrowRight') return;
      if (phase === 'title-card') {
        e.stopPropagation();
        setPhase('split');
      } else if (phase === 'touring') {
        e.stopPropagation();
        if (notebookSection >= PREVIEW_SLIDES.length - 1) {
          setPhase('expanding');
        } else {
          setNotebookSection((s) => s + 1);
        }
      } else if (phase === 'expanding') {
        e.stopPropagation();
        setPhase('crossfade');
      }
      // All other phases: don't stop propagation — App handles slide advance
    };
    window.addEventListener('keydown', handleKey, true); // capture phase fires first
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [phase, notebookSection]);

  useEffect(() => {
    if (phase !== 'crossfade') return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setOverlayActive(true)));
    const t = setTimeout(() => setPhase('done'), 600);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'done') return;
    onAdvanceInstant?.();
  }, [phase, onAdvanceInstant]);

  // ── Render ────────────────────────────────────────────────────────────────

  const PreviewSlide = notebookSection >= 0 ? PREVIEW_SLIDES[notebookSection] : null;

  return (
    <div className="slide0-root">
      <div className="slide0-canvas">

      {/* ── Left: Jupyter notebook (slides in on split) ── */}
      <div className={`slide0-nb${isSplit && !isExpanding ? ' slide0-nb--visible' : ''}`}>
        <div className="slide0-nb__tabs">
          <div className="slide0-nb__tab">
            <span className="slide0-nb__tab-dot" />
            <span>FIFA_World_Cup_2026_Predictions.ipynb</span>
            <span className="slide0-nb__tab-close">×</span>
          </div>
        </div>

        <div className="slide0-nb__body" ref={nbBodyRef}>
          <div className="nb-pad">

            {/* ── Title ── */}
            <NbMd>
              <p className="nb-h1">⚽ FIFA World Cup 2026 — ML Prediction Engine</p>
              <p className="nb-sub">Elo Ratings · Monte Carlo Simulation · 50,000 runs</p>
              <p className="nb-meta">Raw Match Data → Elo Engine → Monte Carlo → Knockout Predictions</p>
            </NbMd>

            {/* ── Section 1: Environment Setup ── */}
            <NbMd><p className="nb-h2">Section 1 — Environment Setup</p></NbMd>
            <NbCode n={1} lines={IMPORTS_LINES} />
            <NbOut n={1}>
              <pre>{'✅ Libraries loaded\n   pandas 2.2.1  ·  numpy 1.26.4  ·  xgboost 2.0.3  ·  plotly 5.20.0'}</pre>
            </NbOut>

            {/* ── Section 2: Data Acquisition ── */}
            <NbMd>
              <p className="nb-h2">Section 2 — Data Acquisition</p>
              <p className="nb-desc">Download ~49k international match results from martj42/international-football-results on GitHub (Kaggle mirror).</p>
            </NbMd>
            <NbCode n={2} lines={DATA_LINES} />
            <NbOut n={2}>
              <pre>{'✅ Loaded 49,532 matches\n   Period : 1872–2024\n   Shape  : (49532, 9)'}</pre>
            </NbOut>

            {/* ── Section 3: Preprocessing ── */}
            <NbMd>
              <p className="nb-h2">Section 3 — Data Preprocessing</p>
              <p className="nb-desc">Filter to 2010+ for stronger signal. Standardise team name aliases. Assign tournament importance weights.</p>
            </NbMd>
            <NbCode n={3} lines={PREP_LINES} />
            <NbOut n={3}>
              <pre>{'✅ 12,847 matches retained · 4 aliases applied'}</pre>
            </NbOut>
            <NbCode n={4} lines={WEIGHT_LINES} />
            <NbOut n={4}>
              <pre>{'   weight distribution:\n   4.0 (World Cup)  ·  418 matches\n   3.0 (Euro/Copa)  ·  892 matches\n   2.0 (qualifier)  · 4,231 matches\n   0.5 (friendly)   · 5,812 matches'}</pre>
            </NbOut>

            {/* ── Section 3b: Feature Engineering ── */}
            <NbMd>
              <p className="nb-h2">Section 3b — Feature Engineering</p>
              <p className="nb-desc">Expected score via logistic Elo formula. K-factor scaled by tournament weight and margin of victory.</p>
            </NbMd>
            <NbCode n={5} lines={FEAT_LINES} />

            {/* ── Section 4: Elo Rating Engine ── */}
            <div ref={sec0Ref}>
              <NbMd active={notebookSection === 0}>
                <p className="nb-h2">Section 4 — Elo Rating Engine</p>
                <p className="nb-desc">Process all 12,847 matches chronologically. Time-decayed K-factor, margin-of-victory multiplier, host bonus (+100) for USA · Canada · Mexico.</p>
              </NbMd>
              <NbCode n={6} lines={ELO_LINES} active={notebookSection === 0} />
              <NbOut n={6}>
                <pre>{'✅ Elo ratings computed for 211 teams\n\n   Rank  Team           Elo    Δ(1yr)\n   ──────────────────────────────────\n   1     France         1842   +23\n   2     Brazil         1821    −8\n   3     Argentina      1804   +12\n   4     England        1781   +31\n   5     Spain          1773   +18\n   6     Portugal       1761    +6\n   7     Germany        1748   −14\n   8     Netherlands    1731   +22'}</pre>
              </NbOut>
            </div>

            {/* ── Section 4b: Elo Visualisation ── */}
            <NbMd>
              <p className="nb-h2">Section 4b — Elo History Visualisation</p>
              <p className="nb-desc">Plotly line chart showing Elo trajectory for top 10 teams over the past decade.</p>
            </NbMd>
            <NbCode n={7} lines={VIZ_LINES} />

            {/* ── Section 5: Backtesting ── */}
            <NbMd>
              <p className="nb-h2">Section 5 — Backtesting (WC 2022)</p>
              <p className="nb-desc">Validate the model against Qatar 2022 using an Elo snapshot frozen at tournament start. Measure Top-4 overlap and Brier score.</p>
            </NbMd>
            <NbCode n={8} lines={BACKTEST_LINES} />
            <NbOut n={8}>
              <pre>{'✅ Backtest — WC 2022\n   Top-4 overlap  :  3/4   (Argentina ✓  France ✓  Morocco ✓)\n   Winner correct :  ✗     predicted France  |  actual Argentina\n   Top-8 accuracy :  6/8   (75.0 %)\n   Brier Score    :  0.187'}</pre>
            </NbOut>

            {/* ── Section 6: WC 2026 Group Draw ── */}
            <NbMd>
              <p className="nb-h2">Section 6 — 2026 World Cup Group Draw</p>
              <p className="nb-desc">Official FIFA draw — 12 groups of 4 teams, 48 nations total. Hosted by USA, Canada, Mexico.</p>
            </NbMd>
            <NbCode n={10} lines={DRAW_LINES} />
            <NbOut n={10}>
              <pre>{'✅ 48 teams across 12 groups'}</pre>
            </NbOut>

            {/* ── Section 7: Monte Carlo Engine ── */}
            <NbMd>
              <p className="nb-h2">Section 7 — Monte Carlo Simulation Engine</p>
              <p className="nb-desc">sim_match draws from Elo win probability. sim_group runs full round-robin. sim_knockout advances winners through R32 → Final.</p>
            </NbMd>
            <NbCode n={11} lines={MC_LINES} />

            {/* ── Section 8: Group Stage Simulation ── */}
            <div ref={sec1Ref}>
              <NbMd active={notebookSection === 1}>
                <p className="nb-h2">Section 8 — Group Stage Simulation</p>
                <p className="nb-desc">50,000 Monte Carlo runs of all 12 groups. Tracks qualification probability and average points per team.</p>
              </NbMd>
              <NbCode n={12} lines={GROUPS_SIM_LINES} active={notebookSection === 1} />
              <NbOut n={12}>
                <pre>{'✅ Group stage simulation complete (50,000 runs)\n\n   Group A:  Mexico 6.23pts 73%  ·  USA 5.81pts 68%  ·  Uruguay 4.92pts 55%\n   Group D:  France 7.12pts 84%  ·  England 6.44pts 76%  ·  Morocco 4.81pts 52%\n   Group E:  Spain  6.89pts 81%  ·  Germany 6.32pts 74%  ·  Belgium 4.61pts 49%'}</pre>
              </NbOut>
            </div>

            {/* ── Section 8b: Third-Place Rule ── */}
            <NbMd>
              <p className="nb-h2">Section 8b — Best-8 Third-Place Rule</p>
              <p className="nb-desc">Of 12 third-place finishers, the best 8 (by average points) advance to complete the 32-team R32 bracket.</p>
            </NbMd>
            <NbCode n={13} lines={THIRD_LINES} />
            <NbOut n={13}>
              <pre>{'✅ R32 field: 32 teams confirmed\n   Best 3rd: Germany (5.21) · Portugal (5.14) · Netherlands (5.08) …'}</pre>
            </NbOut>

            {/* ── Section 9: Knockout Stage ── */}
            <div ref={sec2Ref}>
              <NbMd active={notebookSection === 2}>
                <p className="nb-h2">Section 9 — Knockout Stage Simulation</p>
                <p className="nb-desc">R32 → R16 → QF → SF → Final. Random bracket draw. No draws — extra time resolved by Elo probability.</p>
              </NbMd>
              <NbCode n={14} lines={KNOCKOUT_LINES} active={notebookSection === 2} />
              <NbOut n={14}>
                <pre>{'🏆 Win Probability — Top 8 (50,000 sims)\n\n   1.  France      18.4%   Final 34.2%   SF 52.1%\n   2.  Brazil      15.2%   Final 29.8%   SF 46.3%\n   3.  Argentina   12.8%   Final 25.1%   SF 41.7%\n   4.  England      9.1%   Final 18.4%   SF 33.2%\n   5.  Spain        8.7%   Final 17.9%   SF 32.4%\n   6.  Portugal     7.3%   Final 15.1%   SF 28.9%\n   7.  Germany      6.2%   Final 12.8%   SF 25.1%\n   8.  Netherlands  4.8%   Final  9.7%   SF 19.4%'}</pre>
              </NbOut>
            </div>

            {/* ── Section 10: Export ── */}
            <NbMd>
              <p className="nb-h2">Section 10 — Export Results as JSON</p>
              <p className="nb-desc">Serialize all outputs to /data/ for the interactive visualisation layer.</p>
            </NbMd>
            <NbCode n={15} lines={EXPORT_LINES} />
            <NbOut n={15}>
              <pre>{'✅ Exported 4 JSON files → data/\n   elo_ratings.json            (211 teams)\n   group_standings.json        (12 groups × 4 teams)\n   knockout_probabilities.json (48 teams × 6 rounds)\n   top_favorites.json          (top 15 teams)'}</pre>
            </NbOut>

          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="slide0-right">

        {/* Screen recording — fades out when title card begins */}
        <div className={`slide0-video${phase === 'video' ? ' slide0-video--visible' : ''}`}>
          <video
            ref={videoRef}
            src="/bob-session.mp4"
            autoPlay
            muted
            playsInline
            onEnded={() => setPhase('title-card')}
            onError={() => setPhase('split')}
          />
        </div>

        {/* Slide preview — fades in during split mode */}
        <div className={`slide0-preview${isSplit ? ' slide0-preview--visible' : ''}`}>
          {PreviewSlide && <PreviewSlide key={notebookSection} active={isSplit} />}
        </div>
      </div>
      </div>{/* end slide0-canvas */}

      {/* "Here's what Bob built" card — bridges video → split */}
      <div className={`slide0-title-card${phase === 'title-card' ? ' slide0-title-card--visible' : ''}`}>
        <p className="slide0-title-card__eyebrow">IBM BOB · Claude Code</p>
        <h2 className="slide0-title-card__heading">Here&apos;s what it built</h2>
        <p className="slide0-title-card__sub">
          FIFA World Cup 2026 · Jupyter Notebook · 50,000 Monte Carlo simulations
        </p>
      </div>

      <div className={`s0-overlay${overlayActive ? ' s0-overlay--visible' : ''}`}>
        <TitleSlideContent variant="full" />
      </div>
    </div>
  );
}
