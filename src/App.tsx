import './App.css';
import { useState } from 'react';
import BingoBoard from './components/BingoBoard';
import GloboRapier from './components/GloboRapier';
import CardGenerator from './components/CardGenerator';
import { translations } from './translations';
import About from './components/About';
import HowToPlay from './components/HowToPlay';
import PrivacyPolicy from './components/PrivacyPolicy';
import CardTips from './components/CardTips';
import BingoHistory from './components/BingoHistory';
import { sounds } from './utils/sound';

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
  const [muted, setMuted] = useState(false);

  const t = translations[language];

  const handleDraw = () => {
    if (!remainingBalls.length) return;
    const randomIdx = Math.floor(Math.random() * remainingBalls.length);
    const drawnNumber = remainingBalls[randomIdx];
    
    setDrawnBalls((prev) => [drawnNumber, ...prev]);
    setLastBall(drawnNumber);
    setRemainingBalls((prev) => prev.filter((n) => n !== drawnNumber));
    
    // Play ball draw animation sound
    sounds.playBallDraw();
  };

  const handleReset = () => {
    if (window.confirm(t.confirmNewGame)) {
      setDrawnBalls([]);
      setRemainingBalls(allBalls);
      setLastBall(null);
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = sounds.toggleMute();
    setMuted(nextMuted);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      
      {/* HEADER NAVBAR */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo and Subtitle */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Bingofy
          </h1>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginTop: '-2px' }}>
            {t.appSubtitle}
          </span>
        </div>

        {/* Quick Links Menu */}
        <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <a href="#about" style={menuLinkStyle}>{t.aboutTitle.split(' ')[0]}</a>
          <a href="#how" style={menuLinkStyle}>{t.howToPlayTitle.split(' ')[0]}</a>
          <a href="#privacy" style={menuLinkStyle}>{t.privacyTitle.split(' ')[2] || t.privacyTitle}</a>
          <a href="#cardtips" style={menuLinkStyle}>{t.cardTipsTitle.split(' ')[2] || t.cardTipsTitle}</a>
          <a href="#history" style={menuLinkStyle}>{t.bingoHistoryTitle.split(' ')[1] || t.bingoHistoryTitle}</a>
        </nav>

        {/* Action Controls (Lang, Mute) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Mute Button */}
          <button 
            onClick={handleMuteToggle}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '13px' }}
          >
            {muted ? '🔇' : '🔊'} {t.soundToggle}
          </button>

          {/* Lang Selector flags */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
            {(['pt', 'en', 'es'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  fontSize: '18px',
                  opacity: language === lang ? 1 : 0.4,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  backgroundColor: language === lang ? '#fff' : 'transparent',
                  boxShadow: language === lang ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {lang === 'pt' && '🇧🇷'}
                {lang === 'en' && '🇺🇸'}
                {lang === 'es' && '🇪🇸'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* DASHBOARD HERO CONTAINER */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Main interactive grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* COLUMN 1: The 3D Drawing Cage */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            
            {/* 3D Render Cage Frame */}
            <div style={{ width: '100%', height: '420px', borderRadius: '16px', overflow: 'hidden', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', border: '1px solid rgba(226, 232, 240, 0.6)', marginBottom: '20px' }}>
              <GloboRapier drawnBalls={drawnBalls} />
            </div>

            {/* Drawing Controls */}
            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                🗑️ {t.newGame}
              </button>
              <button
                onClick={handleDraw}
                disabled={remainingBalls.length === 0}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                🔮 {t.drawBall}
              </button>
            </div>
          </div>

          {/* COLUMN 2: Master Bingo Board */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <BingoBoard
              drawnBalls={drawnBalls}
              lastBall={lastBall}
              onReset={handleReset}
              language={language}
            />
          </div>

          {/* COLUMN 3: Playable Card Generator */}
          <div>
            <CardGenerator language={language} />
          </div>

        </div>

        {/* STATIC SECTIONS SECTION */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section id="about">
            <About language={language} />
          </section>
          <section id="how">
            <HowToPlay language={language} />
          </section>
          <section id="privacy">
            <PrivacyPolicy language={language} />
          </section>
          <section id="cardtips">
            <CardTips language={language} />
          </section>
          <section id="history">
            <BingoHistory language={language} />
          </section>
        </div>

      </main>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: '#fff',
        color: 'var(--text-muted)',
        fontSize: '14px',
        fontWeight: 500
      }}>
        <p>Bingofy &copy; {new Date().getFullYear()} - {t.footerText}</p>
      </footer>
    </div>
  );
}

const menuLinkStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  transition: 'color 0.2s',
};

export default App;
