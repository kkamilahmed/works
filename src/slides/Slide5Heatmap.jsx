import { Fragment, useEffect, useMemo, useState } from 'react';
import useJsonData from '../hooks/useJsonData';

const STAGES = ['R32', 'R16', 'QF', 'SF', 'Final', 'Winner'];
const TOP_N = 10;
const TOP5_COUNT = 5;
const ROW_STAGGER_MS = 30;

const COLOR_LOW = [0xe8, 0xf4, 0xfd];
const COLOR_HIGH = [0x00, 0x43, 0xce];

function cellColor(value) {
  const t = Math.min(Math.max(value, 0), 100) / 100;
  const rgb = COLOR_LOW.map((c, i) => Math.round(c + (COLOR_HIGH[i] - c) * t));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function cellTextColor(value) {
  return value > 50 ? '#ffffff' : '#161616';
}

function fmtPct(value) {
  return `${value.toFixed(1)}%`;
}

export default function Slide5Heatmap({ active }) {
  const { data } = useJsonData('knockout_probabilities.json');
  const [activationKey, setActivationKey] = useState(0);

  useEffect(() => {
    if (active) setActivationKey((k) => k + 1);
  }, [active]);

  const teams = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.Winner - a.Winner).slice(0, TOP_N);
  }, [data]);

  if (!data) return <div className="s5" />;

  return (
    <div className="s5">
      <p className="s5__eyebrow">Top {TOP_N} Contenders</p>
      <h1 className="s5__title">Survival Odds by Stage</h1>

      <div className="s5__grid" key={activationKey}>
        <div className="s5__header-cell s5__header-cell--label" />
        {STAGES.map((stage) => (
          <div key={stage} className="s5__header-cell">{stage}</div>
        ))}

        {teams.map((team, rowIndex) => {
          const delay = rowIndex * ROW_STAGGER_MS;
          const isTop5 = rowIndex < TOP5_COUNT;
          return (
            <Fragment key={team.team}>
              <div
                className={`s5__label-cell${isTop5 ? ' s5__label-cell--top5' : ''}`}
                style={{ animationDelay: `${delay}ms` }}
              >
                {team.team}
              </div>
              {STAGES.map((stage) => {
                const value = team[stage];
                return (
                  <div
                    key={`${team.team}-${stage}`}
                    className="s5__cell"
                    style={{
                      animationDelay: `${delay}ms`,
                      background: cellColor(value),
                      color: cellTextColor(value),
                    }}
                    data-tooltip={`${team.team} — ${stage}: ${fmtPct(value)}`}
                  >
                    {fmtPct(value)}
                  </div>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
