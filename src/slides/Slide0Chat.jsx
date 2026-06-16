import { useEffect, useRef, useState } from 'react';
import { TitleSlideContent } from './Slide1Title';

const USER_MSG_INPUT =
  'Create a Jupyter notebook that predicts the 2026 FIFA World Cup using an Elo rating system and Monte Carlo simulation (50,000 runs). Download ~49,000 international match results from the Kaggle dataset martj42/international-football-results-from-1872-to-2017…';

const USER_MSG_DISPLAY =
  'Create a Jupyter notebook that predicts the 2026 FIFA World Cup using an Elo rating system and Monte Carlo simulation (50,000 runs). Download ~49,000 international match results…';

const BOB_INTRO_WORDS =
  "I'll help you create a comprehensive Jupyter notebook for predicting the 2026 FIFA World Cup. Let me start by asking a couple of questions first.".split(' ');

const BOB_Q1_WORDS =
  'For the 2026 World Cup groups, should I use the official draw (Groups A–L, 4 teams each) or will you provide a custom grouping?'.split(' ');

const BOB_PERM_WORDS =
  "I have a full plan ready. Ready to switch to code mode and start building the notebook?".split(' ');

const PLAN_ITEMS = [
  'Set up project structure and create requirements.txt with necessary dependencies',
  'Create data acquisition module to download Kaggle dataset with GitHub CSV fallback',
  'Implement data preprocessing: filter matches from 2010+, standardize team names',
  'Build Elo rating engine with configurable parameters (K-factor, time decay, MOV multiplier)',
  'Implement tournament importance weights system (World Cup, continental, qualifiers, friendlies)',
  'Add home advantage (+50) and host bonus (+100 for USA/Canada/Mexico) logic',
  'Process historical matches chronologically to calculate current Elo ratings',
  'Implement backtesting module for 2018 and 2022 World Cups with validation metrics',
  'Create 2026 World Cup group assignments using official draw (Groups A–L)',
  'Build Monte Carlo simulation engine (50,000 runs) for tournament prediction',
  'Implement group stage simulation with round-robin format',
  'Implement best-8 third-place advancement rule to select 32 knockout qualifiers',
  'Build knockout stage simulation with random bracket and no-draw logic',
  'Track per-round advancement probabilities across all simulations',
  'Create Plotly dark-theme Elo history line chart for top 10 teams',
  'Generate heatmap showing all 48 teams across 6 knockout rounds',
  'Create horizontal bar chart for top 15 win probabilities',
  'Assemble complete Jupyter notebook with markdown documentation and code cells',
  'Add validation outputs showing backtest results and model accuracy',
  'Test notebook end-to-end and verify all visualizations render correctly',
];

// Token colors (VS Code Dark+ palette)
const K = '#569cd6'; // keywords
const C = '#6a9955'; // comments
const S = '#ce9178'; // strings
const N = '#b5cea8'; // numbers
const F = '#dcdcaa'; // function names
const D = '#d4d4d4'; // default

const CODE_LINES = [
  [[C, '# ── Cell 1: Imports ─────────────────────────────────────────────────────']],
  [[K, 'import'], [D, ' pandas '], [K, 'as'], [D, ' pd']],
  [[K, 'import'], [D, ' numpy '], [K, 'as'], [D, ' np']],
  [[K, 'import'], [D, ' requests']],
  [[K, 'from'], [D, ' io '], [K, 'import'], [D, ' StringIO']],
  [[K, 'import'], [D, ' plotly.graph_objects '], [K, 'as'], [D, ' go']],
  [[K, 'from'], [D, ' plotly.subplots '], [K, 'import'], [D, ' '], [F, 'make_subplots']],
  [[K, 'import'], [D, ' warnings']],
  [[D, 'warnings.'], [F, 'filterwarnings'], [D, '('], [S, "'ignore'"], [D, ')']],
  [],
  [[C, '# ── Cell 2: Data Acquisition ─────────────────────────────────────────────']],
  [[D, 'KAGGLE_URL = '], [S, '"https://raw.githubusercontent.com/martj42/…"']],
  [],
  [[K, 'def'], [D, ' '], [F, 'load_data'], [D, '():']],
  [[D, '    '], [K, 'try'], [D, ':']],
  [[D, '        df = pd.'], [F, 'read_csv'], [D, '(KAGGLE_URL)']],
  [[D, '        '], [F, 'print'], [D, '('], [S, 'f"✓ Loaded {len(df):,} matches"'], [D, ')']],
  [[D, '        '], [K, 'return'], [D, ' df']],
  [[D, '    '], [K, 'except'], [D, ' Exception:']],
  [[D, '        '], [K, 'return'], [D, ' pd.'], [F, 'read_csv'], [D, '(GITHUB_URL)']],
  [],
  [[D, 'df = '], [F, 'load_data'], [D, '()']],
  [[D, 'df = df[df['], [S, "'date'"], [D, '] >= '], [S, "'2010-01-01'"], [D, '].'], [F, 'copy'], [D, '()']],
  [],
  [[C, '# ── Cell 3: Elo Engine ───────────────────────────────────────────────────']],
  [[D, 'ELO_BASE   = '], [N, '1500']],
  [[D, 'HOME_BONUS = '], [N, '50']],
  [[D, 'HOST_BONUS = '], [N, '100']],
  [[D, 'HOSTS      = {'], [S, '"USA"'], [D, ', '], [S, '"Canada"'], [D, ', '], [S, '"Mexico"'], [D, '}']],
  [],
  [[D, 'ratings = {}']],
  [],
  [[K, 'def'], [D, ' '], [F, 'expected'], [D, '(ra, rb):']],
  [[D, '    '], [K, 'return'], [D, ' '], [N, '1'], [D, ' / ('], [N, '1'], [D, ' + '], [N, '10'], [D, ' ** ((rb - ra) / '], [N, '400'], [D, '))']],
  [],
  [[K, 'def'], [D, ' '], [F, 'k_factor'], [D, '(weight):']],
  [[D, '    '], [K, 'return'], [D, ' {'], [N, '1.0'], [D, ': '], [N, '50'], [D, ', '], [N, '0.9'], [D, ': '], [N, '50'], [D, ', '], [N, '0.7'], [D, ': '], [N, '40'], [D, '}.'], [F, 'get'], [D, '(weight, '], [N, '32'], [D, ')']],
];

const BOB_ACTIVITIES = [
  { atLine: 0,  text: '✓  Switched to code mode', type: 'success' },
  { atLine: 1,  text: '✎  Creating: FIFA_World_Cup_2026_Predictions.ipynb', type: 'action' },
  { atLine: 5,  text: '▶  Writing cell: Imports & dependencies', type: 'working' },
  { atLine: 13, text: '▶  Writing cell: Data acquisition module', type: 'working' },
  { atLine: 24, text: '▶  Writing cell: Elo rating engine', type: 'working' },
];

const PHASES = [
  'welcome',
  'typing-input',
  'submitting',
  'submitted',
  'typing-intro',
  'typing-q1',
  'show-options',
  'auto-select',
  'plan-header',
  'plan-items',
  'typing-perm',
  'show-permission',
  'auto-confirm',
  'split',
  'coding',
  'crossfade',
  'done',
];

const INPUT_TYPE_MS = 13;
const WORD_MS = 68;
const PLAN_ITEM_MS = 95;
const CODE_LINE_MS = 105;

export default function Slide0Chat({ onAdvanceInstant }) {
  const [phase, setPhase] = useState('welcome');
  const [inputChars, setInputChars] = useState(0);
  const [introWords, setIntroWords] = useState(0);
  const [q1Words, setQ1Words] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [planItemsVisible, setPlanItemsVisible] = useState(0);
  const [permWords, setPermWords] = useState(0);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [codeLinesVisible, setCodeLinesVisible] = useState(0);
  const [overlayActive, setOverlayActive] = useState(false);

  const messagesRef = useRef(null);
  const editorRef = useRef(null);

  const phaseIdx = PHASES.indexOf(phase);
  const isAfter = (p) => phaseIdx >= PHASES.indexOf(p);
  const isSplit = isAfter('split');

  // Auto-scroll messages
  useEffect(() => {
    const el = messagesRef.current;
    if (el && !isSplit) el.scrollTop = el.scrollHeight;
  });

  // Auto-scroll editor
  useEffect(() => {
    const el = editorRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  useEffect(() => {
    if (phase !== 'welcome') return;
    const t = setTimeout(() => setPhase('typing-input'), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'typing-input') return;
    if (inputChars >= USER_MSG_INPUT.length) { setPhase('submitting'); return; }
    const t = setTimeout(() => setInputChars((c) => c + 1), INPUT_TYPE_MS);
    return () => clearTimeout(t);
  }, [phase, inputChars]);

  useEffect(() => {
    if (phase !== 'submitting') return;
    const t = setTimeout(() => setPhase('submitted'), 250);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'submitted') return;
    const t = setTimeout(() => setPhase('typing-intro'), 500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'typing-intro') return;
    if (introWords >= BOB_INTRO_WORDS.length) {
      const t = setTimeout(() => setPhase('typing-q1'), 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIntroWords((c) => c + 1), WORD_MS);
    return () => clearTimeout(t);
  }, [phase, introWords]);

  useEffect(() => {
    if (phase !== 'typing-q1') return;
    if (q1Words >= BOB_Q1_WORDS.length) {
      const t = setTimeout(() => setPhase('show-options'), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setQ1Words((c) => c + 1), WORD_MS);
    return () => clearTimeout(t);
  }, [phase, q1Words]);

  useEffect(() => {
    if (phase !== 'show-options') return;
    const t = setTimeout(() => setPhase('auto-select'), 900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'auto-select') return;
    setSelectedOption('official');
    const t = setTimeout(() => setPhase('plan-header'), 700);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'plan-header') return;
    const t = setTimeout(() => setPhase('plan-items'), 600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'plan-items') return;
    if (planItemsVisible >= PLAN_ITEMS.length) {
      const t = setTimeout(() => setPhase('typing-perm'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPlanItemsVisible((c) => c + 1), PLAN_ITEM_MS);
    return () => clearTimeout(t);
  }, [phase, planItemsVisible]);

  useEffect(() => {
    if (phase !== 'typing-perm') return;
    if (permWords >= BOB_PERM_WORDS.length) {
      const t = setTimeout(() => setPhase('show-permission'), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPermWords((c) => c + 1), WORD_MS);
    return () => clearTimeout(t);
  }, [phase, permWords]);

  useEffect(() => {
    if (phase !== 'show-permission') return;
    const t = setTimeout(() => setPhase('auto-confirm'), 900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'auto-confirm') return;
    setSelectedPermission('yes');
    const t = setTimeout(() => setPhase('split'), 700);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'split') return;
    const t = setTimeout(() => setPhase('coding'), 700);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'coding') return;
    if (codeLinesVisible >= CODE_LINES.length) {
      const t = setTimeout(() => setPhase('crossfade'), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCodeLinesVisible((c) => c + 1), CODE_LINE_MS);
    return () => clearTimeout(t);
  }, [phase, codeLinesVisible]);

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

  const submitted = isAfter('submitted');

  return (
    <div className="slide0-root">

      {/* ── Left: Code Editor (appears in split) ── */}
      <div className={`slide0-editor${isSplit ? ' slide0-editor--visible' : ''}`}>
        <div className="slide0-editor__tabs">
          <div className="slide0-editor__tab">
            <span className="slide0-editor__tab-dot" />
            <span>FIFA_World_Cup_2026_Predictions.ipynb</span>
            <span className="slide0-editor__tab-close">×</span>
          </div>
        </div>

        <div className="slide0-editor__body" ref={editorRef}>
          <div className="slide0-editor__gutter">
            {CODE_LINES.slice(0, codeLinesVisible).map((_, i) => (
              <div key={i} className="slide0-editor__ln">{i + 1}</div>
            ))}
            {codeLinesVisible < CODE_LINES.length && (
              <div className="slide0-editor__ln slide0-editor__ln--cursor">
                {codeLinesVisible + 1}
              </div>
            )}
          </div>

          <div className="slide0-editor__code">
            {CODE_LINES.slice(0, codeLinesVisible).map((tokens, i) => (
              <div key={i} className="slide0-editor__line">
                {tokens.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  tokens.map(([color, text], j) => (
                    <span key={j} style={{ color }}>{text}</span>
                  ))
                )}
              </div>
            ))}
            {codeLinesVisible < CODE_LINES.length && (
              <div className="slide0-editor__line">
                <span className="s0-cursor" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Bob panel ── */}
      <div className={`bob${isSplit ? ' bob--narrow' : ''}`}>
        <div className="bob__bar">
          <span className="bob__bar-title">IBM BOB</span>
          <div className="bob__bar-actions">
            <span className="bob__bar-icon">+</span>
            <span className="bob__bar-icon">⚙</span>
          </div>
        </div>

        <div className="bob__messages" ref={messagesRef}>
          <div className="bob__messages-inner">

            {/* Welcome */}
            {!submitted && (
              <div className="bob__welcome">
                <p className="bob__welcome-hi">
                  Hi, I&apos;m <span className="bob__welcome-name">Bob</span>
                </p>
                <p className="bob__welcome-sub">Ask me questions or let me code for you.</p>
              </div>
            )}

            {/* Full conversation (not in split) */}
            {submitted && !isSplit && (
              <>
                <div className="bob-msg bob-msg--user">
                  <span className="bob-msg__label">You</span>
                  <div className="bob-msg__text bob-msg__text--user">{USER_MSG_DISPLAY}</div>
                </div>

                {isAfter('typing-intro') && (
                  <div className="bob-msg bob-msg--bob">
                    <div className="bob-msg__avatar">B</div>
                    <div className="bob-msg__body">
                      <span className="bob-msg__label">Bob</span>
                      <div className="bob-msg__text">
                        {BOB_INTRO_WORDS.slice(0, introWords).join(' ')}
                        {phase === 'typing-intro' && <span className="s0-cursor" />}
                      </div>
                      {isAfter('typing-q1') && (
                        <>
                          <div className="bob-q-divider" />
                          <span className="bob-q-label">Question 1 of 2</span>
                          <div className="bob-msg__text">
                            {BOB_Q1_WORDS.slice(0, q1Words).join(' ')}
                            {phase === 'typing-q1' && <span className="s0-cursor" />}
                          </div>
                          {isAfter('show-options') && (
                            <div className="bob-options">
                              <button className={`bob-option-btn${selectedOption === 'official' ? ' bob-option-btn--selected' : ''}`}>
                                Use the official ones
                              </button>
                              <button className={`bob-option-btn${selectedOption === 'custom' ? ' bob-option-btn--selected' : ''}`}>
                                I&apos;ll provide them
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {isAfter('plan-header') && (
                  <div className="bob-plan">
                    <div className="bob-plan__header">
                      <span className="bob-plan__icon">≡</span>
                      {!isAfter('plan-items') ? 'No pending tasks' : 'Todo List Created'}
                    </div>
                    {isAfter('plan-items') && (
                      <div className="bob-plan__list">
                        {PLAN_ITEMS.slice(0, planItemsVisible).map((item, i) => (
                          <div key={i} className="bob-plan__item">
                            <span className="bob-plan__bullet">○</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isAfter('typing-perm') && (
                  <div className="bob-msg bob-msg--bob">
                    <div className="bob-msg__avatar">B</div>
                    <div className="bob-msg__body">
                      <span className="bob-msg__label">Bob</span>
                      <div className="bob-msg__text">
                        {BOB_PERM_WORDS.slice(0, permWords).join(' ')}
                        {phase === 'typing-perm' && <span className="s0-cursor" />}
                      </div>
                      {isAfter('show-permission') && (
                        <div className="bob-options">
                          <button className={`bob-option-btn bob-option-btn--primary${selectedPermission === 'yes' ? ' bob-option-btn--selected' : ''}`}>
                            Yes, switch to code mode
                          </button>
                          <button className={`bob-option-btn${selectedPermission === 'review' ? ' bob-option-btn--selected' : ''}`}>
                            Let me review first
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Split mode: activity feed */}
            {isSplit && (
              <div className="bob-activity">
                {BOB_ACTIVITIES
                  .filter((a) => codeLinesVisible >= a.atLine)
                  .map((a, i) => (
                    <div key={i} className={`bob-activity__item bob-activity__item--${a.type}`}>
                      {a.text}
                    </div>
                  ))}
              </div>
            )}

          </div>
        </div>

        {/* Composer */}
        <div className="bob__composer">
          <div className="bob__composer-inner">
            <div className="bob__toolbar">
              <div className="bob__toolbar-icons">
                <span className="bob__toggle" />
                <span className="bob__tool-icon">◎</span>
                <span className="bob__tool-icon">✎</span>
                <span className="bob__tool-icon">⊞</span>
                <span className="bob__tool-icon">✕</span>
                <span className="bob__tool-icon">⊕</span>
                <span className="bob__tool-icon">ⓘ</span>
                <span className="bob__tool-icon">≡</span>
                <span className="bob__tool-icon">⚡</span>
              </div>
              {isAfter('typing-input') && !submitted && (
                <button className="bob__cancel-btn">Cancel</button>
              )}
            </div>

            <div className={`bob__input${phase === 'submitting' ? ' bob__input--sending' : ''}`}>
              {!submitted ? (
                <>
                  {USER_MSG_INPUT.slice(0, inputChars)}
                  {phase === 'typing-input' && <span className="s0-cursor" />}
                  {phase === 'welcome' && (
                    <span className="bob__input-ph">Ask a question or provide instructions...</span>
                  )}
                </>
              ) : (
                <span className="bob__input-ph">What&apos;s on your mind?</span>
              )}
            </div>

            <div className="bob__footer">
              <span className="bob__plan-label">
                <span className="bob__footer-icon">≡</span> Plan{' '}
                <span className="bob__footer-arrow">▾</span>
              </span>
              <span className="bob__findings-label">
                <span className="bob__footer-icon">⊕</span> Bob Findings
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`s0-overlay${overlayActive ? ' s0-overlay--visible' : ''}`}>
        <TitleSlideContent variant="full" />
      </div>
    </div>
  );
}
