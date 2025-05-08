import './App.css';
import { useState } from 'react';
import BingoBoard from './components/BingoBoard';
import GloboRapier from './components/GloboRapier';
import { translations } from './translations';
import About from './components/About';
import HowToPlay from './components/HowToPlay';
import PrivacyPolicy from './components/PrivacyPolicy';

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
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* Cabeçalho com menu e bandeiras */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#fff',
        borderBottom: '2px solid #ddd'
      }}>
        {/* Menu */}
        <div style={{ display: 'flex', gap: '30px' }}>
          <a href="#about" style={menuLinkStyle}>{t.aboutTitle}</a>
          <a href="#how" style={menuLinkStyle}>{t.howToPlayTitle}</a>
          <a href="#privacy" style={menuLinkStyle}>{t.privacyTitle}</a>
        </div>

        {/* Bandeiras */}
        <div style={{ display: 'flex', gap: 10 }}>
          {(['pt', 'en', 'es'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                fontSize: '28px',
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
      </div>

      {/* Conteúdo principal */}
      <div style={{
        backgroundColor: '#e0f2fe',
        margin: '40px auto',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '1400px',
        height: 'calc(100vh - 150px)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', gap: 20, height: '100%' }}>
          
          {/* Globo + botões */}
          <div style={{ width: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <GloboRapier drawnBalls={drawnBalls} />

            <div style={{ display: 'flex', gap: '20px', marginTop: 20 }}>
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

          {/* Tabela de Bingo */}
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

      {/* Seções de conteúdo */}
      <div style={{ backgroundColor: '#fff', padding: '40px 20px', color: '#222' }}>
        <section id="about">
          <About language={language} />
        </section>
        <section id="how" style={{ marginTop: '40px' }}>
          <HowToPlay language={language} />
        </section>
        <section id="privacy" style={{ marginTop: '40px' }}>
          <PrivacyPolicy language={language} />
        </section>
      </div>
    </div>
  );
}

const menuLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#222',
  fontWeight: 'bold',
  fontSize: '16px',
  transition: 'color 0.2s',
};

export default App;