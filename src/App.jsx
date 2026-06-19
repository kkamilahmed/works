import { Theme } from '@carbon/react';
import Slide0Chat from './slides/Slide0Chat';
import './styles/slides.css';

function App() {
  return (
    <Theme theme="g100">
      <div className="slide-viewport">
        <div className="slide slide--active">
          <Slide0Chat active={true} />
        </div>
      </div>
    </Theme>
  );
}

export default App;
