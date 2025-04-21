import './App.css';
import { useState } from 'react';
import BingoBoard from './components/BingoBoard';
import GloboRapier from './components/GloboRapier';
import { translations } from './translations';

const getInitialLanguage = (): 'pt' | 'en' | 'es' => {
  const lang = navigator.language.slice(0, 2);
  return ['pt', 'en', 'es'].includes(lang) ? (lang as 'pt' | 'en' | 'es') : 'pt';
};

function App() {
  const allBalls = Array.from({ length: 75 }, (_, i) => i + 1);
  const [remainingBalls, setRemainingBalls] = useState<number[]>(allBalls);
  const [drawnBalls, setDrawnBalls] = useState<number[]>([]);
  const [lastBall, setLastBall] = useState<number | null>(null);
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>(getInitialLanguage());

  const t = translations[language];

  const handleDraw = () => {
    if (!remainingBalls.length) return;
    const randomIdx = Math.floor(Math.random() * remainingBalls.length);
    const drawnNumber = remainingBalls[randomIdx];
    setDrawnBalls((prev) => [drawnNumber, ...prev]);
    setLastBall(drawnNumber);
    setRemainingBalls((prev) => prev.filter((n) => n !== drawnNumber));
  };

  const handleReset = () => {
    if (window.confirm(t.confirmNewGame)) {
      setDrawnBalls([]);
      setRemainingBalls(allBalls);
      setLastBall(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Bandeiras no frame principal */}
      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 10 }}>
        {(['pt', 'en', 'es'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            style={{
              fontSize: '36px',
              opacity: language === lang ? 1 : 0.4,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            {lang === 'pt' && '🇧🇷'}
            {lang === 'en' && '🇺🇸'}
            {lang === 'es' && '🇪🇸'}
          </button>
        ))}
      </div>

      <div style={{
        backgroundColor: '#e0f2fe',
        margin: '40px auto',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '1400px',
        height: 'calc(100vh - 100px)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', gap: 20, padding: '60px 20px 20px', height: 'calc(100vh - 60px)' }}>
          
          {/* Globo + botões */}
          <div style={{ width: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <GloboRapier drawnBalls={drawnBalls} />

            {/* Botões lado a lado abaixo do globo */}
            <div style={{ display: 'flex', gap: '20px', marginTop: 15 }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {t.newGame}
              </button>

              <button
                onClick={handleDraw}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {t.drawBall}
              </button>
            </div>
          </div>

          {/* Cartela de bingo */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <BingoBoard
              drawnBalls={drawnBalls}
              lastBall={lastBall}
              onReset={handleReset}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;