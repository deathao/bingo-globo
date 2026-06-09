import './App.css';
import { useState, useEffect } from 'react';
import BingoBoard from './components/BingoBoard';
import GloboFisico from './components/GloboFisico';
import CardGenerator from './components/CardGenerator';
import GameStats from './components/GameStats';
import ErrorBoundary from './components/ErrorBoundary';
import ConfettiEffect from './components/ConfettiEffect';
import { translations } from './translations';
import About from './components/About';
import HowToPlay from './components/HowToPlay';
import PrivacyPolicy from './components/PrivacyPolicy';
import CardTips from './components/CardTips';
import BingoHistory from './components/BingoHistory';
import { sounds } from './utils/sound';
import { announcer } from './utils/voice';

const getInitialLanguage = (): 'pt' | 'en' | 'es' => {
  const lang = navigator.language.slice(0, 2);
  return ['pt', 'en', 'es'].includes(lang) ? (lang as 'pt' | 'en' | 'es') : 'pt';
};

function App() {
  // Game State
  const allBalls = Array.from({ length: 75 }, (_, i) => i + 1);
  const [remainingBalls, setRemainingBalls] = useState<number[]>(allBalls);
  const [drawnBalls, setDrawnBalls] = useState<number[]>([]);
  const [lastBall, setLastBall] = useState<number | null>(null);
  
  // Customization State
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>(getInitialLanguage());
  const [theme, setTheme] = useState<'light' | 'obsidian' | 'casino'>('obsidian');
  const [muted, setMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [confettiActive, setConfettiActive] = useState(false);

  const t = translations[language];

  // Sync theme class to body
  useEffect(() => {
    document.body.className = '';
    if (theme !== 'light') {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Sync voice settings
  useEffect(() => {
    announcer.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  const handleDraw = () => {
    if (!remainingBalls.length) return;
    const randomIdx = Math.floor(Math.random() * remainingBalls.length);
    const drawnNumber = remainingBalls[randomIdx];
    
    setDrawnBalls((prev) => [drawnNumber, ...prev]);
    setLastBall(drawnNumber);
    setRemainingBalls((prev) => prev.filter((n) => n !== drawnNumber));
    
    // Play synth draw chime
    sounds.playBallDraw();
    
    // Announce ball via Web Speech Synthesis
    announcer.announceBall(drawnNumber, language);
  };

  const handleReset = () => {
    if (window.confirm(t.confirmNewGame)) {
      setDrawnBalls([]);
      setRemainingBalls(allBalls);
      setLastBall(null);
      announcer.cancel();
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = sounds.toggleMute();
    setMuted(nextMuted);
  };

  const triggerCardWinCelebration = () => {
    setConfettiActive(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Viewport Confetti Celebration overlay */}
      <ConfettiEffect active={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* 2. HEADER NAVBAR */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Title branding */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, var(--accent-color) 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Bingofy
          </h1>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginTop: '-2px' }}>
            {t.appSubtitle}
          </span>
        </div>

        {/* Dynamic section links */}
        <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <a href="#about" style={menuLinkStyle}>{t.aboutTitle.split(' ')[0]}</a>
          <a href="#how" style={menuLinkStyle}>{t.howToPlayTitle.split(' ')[0]}</a>
          <a href="#privacy" style={menuLinkStyle}>{t.privacyTitle.split(' ')[2] || t.privacyTitle}</a>
          <a href="#cardtips" style={menuLinkStyle}>{t.cardTipsTitle.split(' ')[2] || t.cardTipsTitle}</a>
          <a href="#history" style={menuLinkStyle}>{t.bingoHistoryTitle.split(' ')[1] || t.bingoHistoryTitle}</a>
        </nav>

        {/* Global Controls Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Theme Selector */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '10px' }}>
            {(['light', 'obsidian', 'casino'] as const).map((tName) => (
              <button
                key={tName}
                onClick={() => setTheme(tName)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: theme === tName ? 'var(--bg-app)' : 'transparent',
                  color: theme === tName ? 'var(--text-color)' : 'var(--text-muted)',
                  boxShadow: theme === tName ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tName === 'light' && '☀️'}
                {tName === 'obsidian' && '🌙'}
                {tName === 'casino' && '🎰'}
              </button>
            ))}
          </div>

          {/* Sound & Voice Announce switches */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={handleMuteToggle}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '13px' }}
              aria-label={muted ? t.unmuteSound : t.muteSound}
            >
              {muted ? '🔇' : '🔊'} {t.soundToggle}
            </button>

            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '13px' }}
              aria-label={voiceEnabled ? 'Desativar Locução' : 'Ativar Locução'}
            >
              🎙️ {voiceEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Language Selector */}
          <div style={{ display: 'flex', gap: '2px', backgroundColor: 'rgba(0,0,0,0.05)', padding: '3px', borderRadius: '10px' }}>
            {(['pt', 'en', 'es'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  fontSize: '16px',
                  opacity: language === lang ? 1 : 0.4,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: language === lang ? 'var(--bg-app)' : 'transparent',
                  boxShadow: language === lang ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s'
                }}
                aria-label={`Mudar idioma para ${lang === 'pt' ? 'Português' : lang === 'en' ? 'Inglês' : 'Espanhol'}`}
              >
                {lang === 'pt' && '🇧🇷'}
                {lang === 'en' && '🇺🇸'}
                {lang === 'es' && '🇪🇸'}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* 3. CORE PLAYING DASHBOARD */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Core Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* PANEL 1: Globe Viewport & Controls */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            
            {/* 3D Canvas guarded by WebGL ErrorBoundary */}
            <div style={{ 
              width: '100%', 
              height: '420px', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              background: 'radial-gradient(circle, var(--bg-card) 0%, rgba(0,0,0,0.05) 100%)', 
              border: '1px solid var(--border-color)', 
              position: 'relative' 
            }}>
              <ErrorBoundary fallbackText={language === 'pt' ? 'Seu navegador não suporta aceleração 3D WebGL ou o Canvas falhou. O jogo continuará funcionando em modo 2D.' : 'Your browser doesn\'t support 3D WebGL acceleration or the Canvas crashed. Rerouting to 2D fallback.'}>
                <GloboFisico drawnBalls={drawnBalls} />
              </ErrorBoundary>
            </div>

            {/* Game Controls */}
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

            {/* Live Stats Telemetry */}
            <GameStats drawnBalls={drawnBalls} language={language} />

          </div>

          {/* PANEL 2: Master Bingo Caller Board */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <BingoBoard
              drawnBalls={drawnBalls}
              lastBall={lastBall}
              onReset={handleReset}
              language={language}
            />
          </div>

          {/* PANEL 3: Interactive Multi-Card Generator */}
          <div>
            <CardGenerator 
              language={language} 
              drawnBalls={drawnBalls}
              onWin={triggerCardWinCelebration}
            />
          </div>

        </div>

        {/* 4. STATIC INFORMATIVE SECTIONS */}
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

      {/* 5. FOOTER */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
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
