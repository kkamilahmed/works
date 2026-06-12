import { useEffect, useMemo, useState } from 'react';
import useJsonData from '../hooks/useJsonData';

const TABLE_STAGGER_MS = 80;
const ROW_BASE_DELAY_MS = 180;
const ROW_STAGGER_MS = 50;

function GroupTable({ letter, rows, eloMap, tableDelay }) {
  return (
    <div className="s2-table" style={{ animationDelay: `${tableDelay}ms` }}>
      <div className="s2-table__header">Group {letter}</div>
      <div className="s2-table__rows">
        {rows.map((row, i) => (
          <div
            key={row.team}
            className="s2-table__row"
            style={{ animationDelay: `${tableDelay + ROW_BASE_DELAY_MS + i * ROW_STAGGER_MS}ms` }}
            data-tooltip={`Elo: ${eloMap[row.team] ?? '—'}`}
          >
            <span className={`s2-dot s2-dot--rank${row.rank}`} />
            <span className="s2-team">{row.team}</span>
            <span className="s2-avg">{row.avgPoints.toFixed(1)}</span>
            <span className="s2-qual">{row.qualPercent.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Slide2Groups({ active }) {
  const { data: groupStandings } = useJsonData('group_standings.json');
  const { data: eloRatings } = useJsonData('elo_ratings.json');
  const [activationKey, setActivationKey] = useState(0);

  useEffect(() => {
    if (active) setActivationKey((k) => k + 1);
  }, [active]);

  const eloMap = useMemo(() => {
    if (!eloRatings) return {};
    return Object.fromEntries(eloRatings.map((t) => [t.team, t.elo]));
  }, [eloRatings]);

  if (!groupStandings) return <div className="s2" />;

  const groupLetters = Object.keys(groupStandings);

  return (
    <div className="s2">
      <p className="s2__eyebrow">Group Stage Predictions</p>
      <h1 className="s2__title">Who Qualifies?</h1>
      <div className="s2__grid" key={activationKey}>
        {groupLetters.map((letter, i) => (
          <GroupTable
            key={letter}
            letter={letter}
            rows={groupStandings[letter]}
            eloMap={eloMap}
            tableDelay={i * TABLE_STAGGER_MS}
          />
        ))}
      </div>
    </div>
  );
}
