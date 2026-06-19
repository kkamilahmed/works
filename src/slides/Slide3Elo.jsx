import { useEffect, useMemo, useRef, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useJsonData from '../hooks/useJsonData';

const MIN_HISTORY_POINTS = 5;
const MAX_TEAMS = 5;
const DRAW_DURATION_MS = 1400;
const DRAW_STAGGER_MS = 120;

const PALETTE = [
  '#4589ff', // blue-40
  '#08bdba', // teal-40
  '#24a148', // green-40
  '#a56eff', // purple-40
  '#ff7eb6', // magenta-40
  '#fa4d56', // red-40
  '#f1c21b', // yellow-30
  '#33b1ff', // cyan-40
  '#ff832b', // orange-40
  '#198038', // green-50
];

export default function Slide3Elo({ active }) {
  const { data } = useJsonData('elo_history.json');
  const chartRef = useRef(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (active) setAnimKey((k) => k + 1);
  }, [active]);

  const teams = useMemo(() => {
    if (!data) return [];
    return data.filter((t) => t.history.length >= MIN_HISTORY_POINTS).slice(0, MAX_TEAMS);
  }, [data]);

  const chartData = useMemo(() => {
    if (teams.length === 0) return [];
    return teams[0].history.map((point, i) => {
      const row = { year: point.year };
      teams.forEach((t) => {
        row[t.team] = t.history[i].elo;
      });
      return row;
    });
  }, [teams]);

  useEffect(() => {
    if (!active || teams.length === 0) return;

    let cancelled = false;
    let attempts = 0;

    const tryDraw = () => {
      if (cancelled) return;
      const container = chartRef.current;
      const paths = container?.querySelectorAll('.recharts-line-curve') ?? [];
      if (paths.length < teams.length) {
        attempts += 1;
        if (attempts < 20) requestAnimationFrame(tryDraw);
        return;
      }
      paths.forEach((path, i) => {
        const length = path.getTotalLength();
        path.style.transition = 'none';
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
        // force reflow so the next style change is treated as a transition start
        path.getBoundingClientRect();
        requestAnimationFrame(() => {
          path.style.transition = `stroke-dashoffset ${DRAW_DURATION_MS}ms ease-in-out ${i * DRAW_STAGGER_MS}ms`;
          path.style.strokeDashoffset = '0';
        });
      });
    };

    requestAnimationFrame(tryDraw);
    return () => {
      cancelled = true;
    };
  }, [active, teams, animKey]);

  if (!data) return <div className="s3" />;

  return (
    <div className="s3">
      <p className="s3__eyebrow">Historical Strength Ratings</p>
      <h1 className="s3__title">Elo Rating History — Top 5 Nations</h1>
      <div className="s3__chart" ref={chartRef} key={animKey}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#393939" strokeDasharray="2 2" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#525252"
              tick={{ fill: '#c6c6c6', fontFamily: 'IBM Plex Mono', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#393939' }}
            />
            <YAxis
              stroke="#525252"
              tick={{ fill: '#c6c6c6', fontFamily: 'IBM Plex Mono', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              width={48}
            />
            <Tooltip
              contentStyle={{ background: '#262626', border: '1px solid #393939', borderRadius: 0 }}
              labelStyle={{ color: '#f4f4f4', fontFamily: 'IBM Plex Mono', fontSize: 12 }}
              itemStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 12 }}
            />
            {teams.map((t, i) => (
              <Line
                key={t.team}
                type="monotone"
                dataKey={t.team}
                name={t.team}
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="s3__legend">
        {teams.map((t, i) => (
          <div className="s3__legend-item" key={t.team}>
            <span className="s3__legend-swatch" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="s3__legend-label">{t.team}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
