import { useEffect, useMemo, useRef, useState } from 'react';
import { TrophyFilled } from '@carbon/icons-react';
import useJsonData from '../hooks/useJsonData';

const ZOOM_DURATION_MS = 900;
const REVEAL_DELAY_MS = ZOOM_DURATION_MS + 200;
const WINNER_DELAY_MS = REVEAL_DELAY_MS + 700;
const CONFETTI_COUNT = 40;

const CONFETTI_COLORS = [
  '#4589ff',
  '#08bdba',
  '#24a148',
  '#a56eff',
  '#ff7eb6',
  '#fa4d56',
  '#f1c21b',
  '#33b1ff',
  '#ff832b',
];

function pairs(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i += 2) result.push([arr[i], arr[i + 1]]);
  return result;
}

function fmtPct(value) {
  return `${value.toFixed(1)}%`;
}

function TeamRow({ team, probability }) {
  return (
    <div className="s4-team">
      <span className="s4-team__name" title={team}>{team}</span>
      <span className="s4-team__prob">{fmtPct(probability)}</span>
    </div>
  );
}

function FinalSlot({ team, probability, revealed }) {
  return (
    <div className="s4-final-slot">
      <span className={`s4-final-slot__face s4-final-slot__face--mask${revealed ? ' s4-final-slot__face--hidden' : ''}`}>
        ???
      </span>
      <span className={`s4-final-slot__face s4-final-slot__face--real${revealed ? ' s4-final-slot__face--visible' : ''}`}>
        <span className="s4-team__name" title={team}>{team}</span>
        <span className="s4-team__prob">{fmtPct(probability)}</span>
      </span>
    </div>
  );
}

function MatchBox({ pair, gridColumn, gridRow, delayMs, kind, revealed, boxRef }) {
  const className = `s4-match s4-match--${kind}`;
  return (
    <div
      ref={boxRef}
      className={className}
      style={{ gridColumn, gridRow, animationDelay: `${delayMs}ms` }}
    >
      {kind === 'final' ? (
        <>
          <FinalSlot team={pair[0].team} probability={pair[0].probability} revealed={revealed} />
          <FinalSlot team={pair[1].team} probability={pair[1].probability} revealed={revealed} />
        </>
      ) : (
        <>
          <TeamRow team={pair[0].team} probability={pair[0].probability} />
          <TeamRow team={pair[1].team} probability={pair[1].probability} />
        </>
      )}
    </div>
  );
}

export default function Slide4Bracket({ active, shouldZoom }) {
  const { data: bracket } = useJsonData('most_likely_bracket.json');
  const [phase, setPhase] = useState('enter');
  const [activationKey, setActivationKey] = useState(0);
  const [svgPaths, setSvgPaths] = useState([]);
  const bracketRef = useRef(null);
  const boxRefs    = useRef({});

  useEffect(() => {
    if (!active) return;
    setActivationKey((k) => k + 1);
    setPhase('enter');
  }, [active]);

  useEffect(() => {
    if (!shouldZoom) return;
    setPhase('zoom');
    const t1 = setTimeout(() => setPhase('reveal'), REVEAL_DELAY_MS);
    const t2 = setTimeout(() => setPhase('winner'), WINNER_DELAY_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [shouldZoom]);

  const columns = useMemo(() => {
    if (!bracket) return [];
    const r32 = pairs(bracket.R32);
    const r16 = pairs(bracket.R16);
    const qf = pairs(bracket.QF);
    const sf = pairs(bracket.SF);
    const final = pairs(bracket.Final);
    return [
      { kind: 'left', depth: 0, matchPairs: r32.slice(0, 8) },
      { kind: 'left', depth: 1, matchPairs: r16.slice(0, 4) },
      { kind: 'left', depth: 2, matchPairs: qf.slice(0, 2) },
      { kind: 'left', depth: 3, matchPairs: sf.slice(0, 1) },
      { kind: 'final', depth: 4, matchPairs: final },
      { kind: 'right', depth: 3, matchPairs: sf.slice(1, 2) },
      { kind: 'right', depth: 2, matchPairs: qf.slice(2, 4) },
      { kind: 'right', depth: 1, matchPairs: r16.slice(4, 8) },
      { kind: 'right', depth: 0, matchPairs: r32.slice(8, 16) },
    ];
  }, [bracket]);

  useEffect(() => {
    if (!columns.length) return;

    const compute = () => {
      const bracketEl = bracketRef.current;
      if (!bracketEl) return;
      const br = bracketEl.getBoundingClientRect();
      // getBoundingClientRect returns visual (post-transform) coords; divide by
      // the CSS scale so SVG paths stay in the element's layout coordinate space.
      const scale = bracketEl.offsetWidth > 0 ? br.width / bracketEl.offsetWidth : 1;

      const getBox = (col, row) => {
        const el = boxRefs.current[`${col}-${row}`];
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left:  (r.left  - br.left) / scale,
          right: (r.right - br.left) / scale,
          cy:    ((r.top + r.bottom) / 2 - br.top) / scale,
          top:   (r.top   - br.top) / scale,
          h:     r.height / scale,
        };
      };

      const paths = [];

      const drawBracket = (m1, m2, parent, side) => {
        if (!m1 || !m2 || !parent) return;
        const midY = (m1.cy + m2.cy) / 2;
        if (side === 'left') {
          const midX = (m1.right + parent.left) / 2;
          paths.push(
            `M${m1.right},${m1.cy} H${midX} V${m2.cy} H${m2.right}` +
            ` M${midX},${midY} H${parent.left}`
          );
        } else {
          const midX = (m1.left + parent.right) / 2;
          paths.push(
            `M${m1.left},${m1.cy} H${midX} V${m2.cy} H${m2.left}` +
            ` M${midX},${midY} H${parent.right}`
          );
        }
      };

      [[0, 1], [1, 2], [2, 3]].forEach(([from, to]) => {
        const count = columns[from].matchPairs.length;
        for (let i = 0; i < count; i += 2)
          drawBracket(getBox(from, i), getBox(from, i + 1), getBox(to, i / 2), 'left');
      });

      const sfL = getBox(3, 0);
      const fin = getBox(4, 0);
      if (sfL && fin) {
        const midX = (sfL.right + fin.left) / 2;
        paths.push(`M${sfL.right},${sfL.cy} H${midX} V${fin.top + fin.h * 0.25} H${fin.left}`);
      }

      [[8, 7], [7, 6], [6, 5]].forEach(([from, to]) => {
        const count = columns[from].matchPairs.length;
        for (let i = 0; i < count; i += 2)
          drawBracket(getBox(from, i), getBox(from, i + 1), getBox(to, i / 2), 'right');
      });

      const sfR = getBox(5, 0);
      if (sfR && fin) {
        const midX = (fin.right + sfR.left) / 2;
        paths.push(`M${sfR.left},${sfR.cy} H${midX} V${fin.top + fin.h * 0.75} H${fin.right}`);
      }

      setSvgPaths(paths);
    };

    const id = requestAnimationFrame(compute);

    // Recompute whenever the bracket resizes (e.g. notebook sidebar collapses)
    const ro = new ResizeObserver(() => requestAnimationFrame(compute));
    if (bracketRef.current) ro.observe(bracketRef.current);

    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [columns, activationKey]);

  const winner = bracket?.Winner?.[0];

  const confetti = useMemo(() => {
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.6,
      duration: 2 + Math.random() * 1.4,
      rotate: Math.random() * 360,
    }));
  }, [activationKey]);

  if (!bracket) return <div className="s4" />;

  const zoomed = phase === 'zoom' || phase === 'reveal' || phase === 'winner';
  const revealed = phase === 'reveal' || phase === 'winner';
  const showWinner = phase === 'winner';

  return (
    <div className="s4" key={activationKey}>
      <div className={`s4__header${zoomed ? ' s4__header--hidden' : ''}`}>
        <p className="s4__eyebrow">Knockout Stage Simulation</p>
        <h1 className="s4__title">The Most Likely Bracket</h1>
      </div>

      <div className={`s4__zoom-wrap${zoomed ? ' s4__zoom-wrap--zoomed' : ''}`}>
        <div className="s4__bracket" ref={bracketRef}>
          <svg className="s4__connectors" aria-hidden="true">
            {svgPaths.map((d, i) => (
              <path key={i} d={d} stroke="#6f6f6f" strokeWidth="1" fill="none" />
            ))}
          </svg>
          {columns.map((col, colIndex) => {
            const span = 8 / col.matchPairs.length;
            return col.matchPairs.map((pair, i) => (
              <MatchBox
                key={`${colIndex}-${i}`}
                pair={pair}
                gridColumn={colIndex + 1}
                gridRow={`${i * span + 1} / span ${span}`}
                delayMs={col.depth * 150 + i * 15}
                kind={col.kind}
                revealed={revealed}
                boxRef={(el) => {
                  if (el) boxRefs.current[`${colIndex}-${i}`] = el;
                  else delete boxRefs.current[`${colIndex}-${i}`];
                }}
              />
            ));
          })}
        </div>
      </div>

      {winner && (
        <div className={`s4__winner${showWinner ? ' s4__winner--visible' : ''}`}>
          <TrophyFilled size={48} className="s4__winner-icon" />
          <div className="s4__winner-name">{winner.team}</div>
          <div className="s4__winner-prob">{fmtPct(winner.probability)} to win it all</div>
        </div>
      )}

      {showWinner && (
        <div className="s4__confetti">
          {confetti.map((c, i) => (
            <span
              key={i}
              className="s4__confetti-piece"
              style={{
                left: `${c.left}%`,
                background: c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                '--rot': `${c.rotate}deg`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
