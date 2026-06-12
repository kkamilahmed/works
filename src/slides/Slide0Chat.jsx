import { useEffect, useRef, useState } from 'react';
import { TitleSlideContent } from './Slide1Title';

const USER_MESSAGE = 'Can you predict the 2026 FIFA World Cup?';

const REASONING_LINES = [
  '▸ Analysing request...',
  '▸ Loading match dataset (49,247 matches, 1872–2026)',
  '▸ Initializing Elo rating engine...',
  '▸ Computing time-decay weights...',
  '▸ Processing 48 qualified teams...',
  '▸ Running Monte Carlo simulation (50,000 iterations)...',
  '▸ Generating group stage predictions...',
  '▸ Simulating knockout bracket...',
  '▸ Compiling prediction report...',
  '✓ Complete',
];

const BOB_RESPONSE =
  "Absolutely. I've modelled all 48 teams across 50,000 Monte Carlo simulations — Elo ratings, form data, head-to-head history. Here's what the numbers say.";
const BOB_WORDS = BOB_RESPONSE.split(' ');

const USER_TYPE_MS = 55;
const REASONING_LINE_MS = 380;
const BOB_WORD_MS = 90;

export default function Slide0Chat({ onAdvanceInstant }) {
  const [phase, setPhase] = useState('typing-user');
  const [userChars, setUserChars] = useState(0);
  const [reasoningCount, setReasoningCount] = useState(0);
  const [bobWords, setBobWords] = useState(0);
  const [cardZoomStyle, setCardZoomStyle] = useState(null);
  const [cardEntered, setCardEntered] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);

  const cardRef = useRef(null);

  // Phase: user message types in character by character.
  useEffect(() => {
    if (phase !== 'typing-user') return;
    if (userChars >= USER_MESSAGE.length) {
      setPhase('pause-after-user');
      return;
    }
    const t = setTimeout(() => setUserChars((c) => c + 1), USER_TYPE_MS);
    return () => clearTimeout(t);
  }, [phase, userChars]);

  // Phase: 400ms pause, then reasoning panel activates.
  useEffect(() => {
    if (phase !== 'pause-after-user') return;
    const t = setTimeout(() => setPhase('reasoning'), 400);
    return () => clearTimeout(t);
  }, [phase]);

  // Phase: reasoning lines appear 380ms apart.
  useEffect(() => {
    if (phase !== 'reasoning') return;
    if (reasoningCount >= REASONING_LINES.length) {
      const t = setTimeout(() => setPhase('typing-bob'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setReasoningCount((c) => c + 1), REASONING_LINE_MS);
    return () => clearTimeout(t);
  }, [phase, reasoningCount]);

  // Phase: Bob's response types in word by word.
  useEffect(() => {
    if (phase !== 'typing-bob') return;
    if (bobWords >= BOB_WORDS.length) {
      setPhase('card-appear');
      return;
    }
    const t = setTimeout(() => setBobWords((c) => c + 1), BOB_WORD_MS);
    return () => clearTimeout(t);
  }, [phase, bobWords]);

  // Phase: report card slides up, waits 1s, then zooms to fill the viewport.
  useEffect(() => {
    if (phase !== 'card-appear') return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setCardEntered(true));
    });
    const t = setTimeout(() => setPhase('card-zoom'), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [phase]);

  // Phase: card zoom — animate transform: scale() to cover the viewport.
  useEffect(() => {
    if (phase !== 'card-zoom') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    setCardZoomStyle({
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: 0,
      transform: 'translate(0px, 0px) scale(1, 1)',
      transition: 'none',
      zIndex: 40,
    });

    const scaleX = window.innerWidth / rect.width;
    const scaleY = window.innerHeight / rect.height;

    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCardZoomStyle((style) => ({
          ...style,
          transform: `translate(${-rect.left}px, ${-rect.top}px) scale(${scaleX}, ${scaleY})`,
          transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        }));
      });
    });

    const t = setTimeout(() => setPhase('crossfade'), 600);
    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t);
    };
  }, [phase]);

  // Phase: while the card is at max scale, crossfade to Slide 1.
  useEffect(() => {
    if (phase !== 'crossfade') return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOverlayActive(true));
    });
    const t = setTimeout(() => setPhase('done'), 300);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [phase]);

  // Phase: handoff to Slide 1 without a duplicate slide transition.
  useEffect(() => {
    if (phase !== 'done') return;
    onAdvanceInstant?.();
  }, [phase, onAdvanceInstant]);

  const showReasoning =
    phase === 'reasoning' ||
    phase === 'typing-bob' ||
    phase === 'card-appear' ||
    phase === 'card-zoom' ||
    phase === 'crossfade' ||
    phase === 'done';

  const showBobMessage =
    phase === 'typing-bob' ||
    phase === 'card-appear' ||
    phase === 'card-zoom' ||
    phase === 'crossfade' ||
    phase === 'done';

  const showCard =
    phase === 'card-appear' || phase === 'card-zoom' || phase === 'crossfade' || phase === 'done';

  return (
    <div className="s0">
      <div className="s0__chat">
        <div className="s0-msg s0-msg--user">
          <span className="s0-msg__author">You</span>
          <div className="s0-bubble">
            {USER_MESSAGE.slice(0, userChars)}
            {phase === 'typing-user' && <span className="s0-cursor" />}
          </div>
        </div>

        {showBobMessage && (
          <div className="s0-msg s0-msg--bob">
            <span className="s0-msg__author">Bob</span>
            <div className="s0-bubble">
              {BOB_WORDS.slice(0, bobWords).join(' ')}
              {phase === 'typing-bob' && <span className="s0-cursor" />}
            </div>

            {showCard && (
              <div className="s0-card-wrap">
                <div
                  ref={cardRef}
                  className={`s0-card ${cardEntered ? 's0-card--visible' : ''}`}
                  style={cardZoomStyle ?? undefined}
                >
                  <span className="s0-card__label">Prediction Analysis Report</span>
                  <div className="s0-card__inner">
                    <TitleSlideContent variant="mini" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="s0__reasoning">
        <div className={`s0-reasoning__header ${showReasoning ? 's0-reasoning__header--active' : ''}`}>
          Reasoning...
        </div>
        <div className="s0-reasoning__lines">
          {REASONING_LINES.slice(0, reasoningCount).map((line, i) => (
            <div key={i} className="s0-reasoning__line">
              {line}
            </div>
          ))}
        </div>
      </div>

      <div className={`s0-overlay ${overlayActive ? 's0-overlay--visible' : ''}`}>
        <TitleSlideContent variant="full" />
      </div>
    </div>
  );
}
