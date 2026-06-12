export function TitleSlideContent({ variant = 'full' }) {
  return (
    <div className={`title-slide${variant === 'mini' ? ' title-slide--mini' : ''}`}>
      <p className="title-slide__eyebrow">FIFA World Cup 2026</p>
      <div className="title-slide__accent" />
      <h1 className="title-slide__heading">Prediction Analysis</h1>
      <p className="title-slide__subline">
        Powered by Bob · 50,000 Monte Carlo Simulations · Elo + Monte Carlo
      </p>
    </div>
  );
}

export default function Slide1Title() {
  return <TitleSlideContent variant="full" />;
}
