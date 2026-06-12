import { useCallback, useEffect, useState } from 'react';
import { Theme } from '@carbon/react';
import Slide0Chat from './slides/Slide0Chat';
import Slide1Title from './slides/Slide1Title';
import Slide2Groups from './slides/Slide2Groups';
import Slide3Elo from './slides/Slide3Elo';
import Slide4Bracket from './slides/Slide4Bracket';
import Slide5Heatmap from './slides/Slide5Heatmap';
import './styles/slides.css';

const SLIDES = [Slide0Chat, Slide1Title, Slide2Groups, Slide3Elo, Slide4Bracket, Slide5Heatmap];
const LAST_INDEX = SLIDES.length - 1;

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [instant, setInstant] = useState(false);

  const goNext = useCallback(() => {
    setCurrentSlide((slide) => Math.min(slide + 1, LAST_INDEX));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((slide) => Math.max(slide - 1, 0));
  }, []);

  // Slide 0 hands off to Slide 1 via its own crossfade, so the global
  // slide-to-slide transform transition is skipped for this one step.
  const advanceInstant = useCallback(() => {
    setInstant(true);
    setCurrentSlide(1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setInstant(false));
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') goNext();
      else if (event.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return (
    <Theme theme="g100">
      <div className="slide-viewport">
        {SLIDES.map((SlideComponent, index) => {
          const relative = index - currentSlide;
          const position = relative === 0 ? 'active' : relative > 0 ? 'next' : 'prev';
          return (
            <div
              key={index}
              className={`slide slide--${position}${instant ? ' slide--no-transition' : ''}`}
            >
              <SlideComponent
                active={index === currentSlide}
                onAdvance={goNext}
                onAdvanceInstant={advanceInstant}
              />
            </div>
          );
        })}
      </div>

      {currentSlide > 0 && (
        <div className="slide-nav">
          <button className="slide-nav__btn" onClick={goPrev}>
            ← Prev
          </button>
          <span className="slide-nav__counter ibm-plex-mono">
            {String(currentSlide).padStart(2, '0')} / {String(LAST_INDEX).padStart(2, '0')}
          </span>
          {currentSlide < LAST_INDEX && (
            <button className="slide-nav__btn" onClick={goNext}>
              Next →
            </button>
          )}
        </div>
      )}
    </Theme>
  );
}

export default App;
