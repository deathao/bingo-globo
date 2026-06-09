import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { sounds } from '../utils/sound';

type Props = {
  language: 'pt' | 'en' | 'es';
  drawnBalls: number[];
  onWin: () => void;
};

type CardMatrix = Record<string, number[]>;

const generateColumnNumbers = (min: number, max: number, count: number): number[] => {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result.sort((a, b) => a - b);
};

const createNewCard = (): CardMatrix => {
  return {
    B: generateColumnNumbers(1, 15, 5),
    I: generateColumnNumbers(16, 30, 5),
    N: generateColumnNumbers(31, 45, 5), // N2 is replaced by FREE space
    G: generateColumnNumbers(46, 60, 5),
    O: generateColumnNumbers(61, 75, 5),
  };
};

export const CardGenerator = ({ language, drawnBalls, onWin }: Props) => {
  const t = translations[language];
  
  // Cards State
  const [cardCount, setCardCount] = useState<number>(1);
  const [cards, setCards] = useState<CardMatrix[]>([]);
  // Store marked states: array of records, index matches card index
  const [markedStates, setMarkedStates] = useState<Record<string, boolean>[]>([]);
  const [winningCards, setWinningCards] = useState<Record<number, boolean>>({});
  
  // Gameplay Settings
  const [autoMark, setAutoMark] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // For mobile card navigation

  // Initialize cards
  const initializeCards = (count: number) => {
    const newCards: CardMatrix[] = [];
    const newMarked: Record<string, boolean>[] = [];
    for (let i = 0; i < count; i++) {
      newCards.push(createNewCard());
      newMarked.push({ 'N-2': true }); // Center is FREE
    }
    setCards(newCards);
    setMarkedStates(newMarked);
    setWinningCards({});
    setActiveTab(0);
  };

  useEffect(() => {
    initializeCards(cardCount);
  }, [cardCount]);

  // Auto-daubing logic when drawnBalls changes
  useEffect(() => {
    if (drawnBalls.length === 0) {
      // Game was reset, reset markings (except FREE)
      setMarkedStates((prev) => prev.map(() => ({ 'N-2': true })));
      setWinningCards({});
      return;
    }

    const lastBall = drawnBalls[0];

    // If auto-mark is enabled, mark the ball automatically
    if (autoMark) {
      setMarkedStates((prevMarked) => {
        const updated = prevMarked.map((marked, cardIdx) => {
          const card = cards[cardIdx];
          if (!card) return marked;

          const nextMarked = { ...marked };
          // Search for ball in columns
          let colFound = '';
          let rowFound = -1;

          for (const col of ['B', 'I', 'N', 'G', 'O']) {
            const rowIdx = card[col].indexOf(lastBall);
            if (rowIdx !== -1) {
              colFound = col;
              rowFound = rowIdx;
              break;
            }
          }

          if (rowFound !== -1) {
            nextMarked[`${colFound}-${rowFound}`] = true;
            
            // Check win for this specific card
            setTimeout(() => {
              checkCardWin(cardIdx, nextMarked);
            }, 50);
          }

          return nextMarked;
        });
        return updated;
      });
    }
  }, [drawnBalls, autoMark, cards]);

  const toggleMark = (cardIdx: number, col: string, rowIndex: number) => {
    if (col === 'N' && rowIndex === 2) return; // Free space

    const key = `${col}-${rowIndex}`;
    setMarkedStates((prev) => {
      const nextStates = [...prev];
      const currentMarked = { ...nextStates[cardIdx] };
      currentMarked[key] = !currentMarked[key];
      nextStates[cardIdx] = currentMarked;

      checkCardWin(cardIdx, currentMarked);
      return nextStates;
    });
  };

  const checkCardWin = (cardIdx: number, currentMarked: Record<string, boolean>) => {
    const cols = ['B', 'I', 'N', 'G', 'O'];
    const isPosMarked = (c: string, r: number) => {
      if (c === 'N' && r === 2) return true;
      return !!currentMarked[`${c}-${r}`];
    };

    let won = false;

    // 1. Check rows
    for (let r = 0; r < 5; r++) {
      if (cols.every((c) => isPosMarked(c, r))) won = true;
    }

    // 2. Check cols
    for (const c of cols) {
      if (Array.from({ length: 5 }).every((_, r) => isPosMarked(c, r))) won = true;
    }

    // 3. Diagonals
    if (cols.every((c, idx) => isPosMarked(c, idx))) won = true;
    if (cols.every((c, idx) => isPosMarked(c, 4 - idx))) won = true;

    // 4. Four corners
    if (isPosMarked('B', 0) && isPosMarked('B', 4) && isPosMarked('O', 0) && isPosMarked('O', 4)) won = true;

    if (won) {
      setWinningCards((prev) => {
        if (prev[cardIdx]) return prev; // Already registered
        onWin(); // Trigger parent celebration
        return { ...prev, [cardIdx]: true };
      });
    } else {
      setWinningCards((prev) => {
        const next = { ...prev };
        delete next[cardIdx];
        return next;
      });
    }
  };

  const handleResetCard = (cardIdx: number) => {
    setMarkedStates((prev) => {
      const next = [...prev];
      next[cardIdx] = { 'N-2': true };
      return next;
    });
    setWinningCards((prev) => {
      const next = { ...prev };
      delete next[cardIdx];
      return next;
    });
  };

  // Helper to count marked numbers per card
  const getMarkedCount = (cardIdx: number): number => {
    const state = markedStates[cardIdx];
    if (!state) return 0;
    return Object.values(state).filter(Boolean).length - 1; // subtract FREE space
  };

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-color)', margin: 0 }}>
            {t.generateCardTitle}
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {language === 'pt' ? 'Jogue com até 4 cartelas simultâneas' : language === 'es' ? 'Juega con hasta 4 cartones' : 'Play with up to 4 cards'}
          </span>
        </div>

        {/* Card Count Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          {([1, 2, 3, 4] as const).map((count) => (
            <button
              key={count}
              onClick={() => setCardCount(count)}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                backgroundColor: cardCount === count ? 'var(--accent-color)' : 'transparent',
                color: cardCount === count ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-Dauber and Reset options */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-color)' }}>
          <input 
            type="checkbox" 
            checked={autoMark} 
            onChange={(e) => setAutoMark(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
          />
          {language === 'pt' ? '🎯 Marcação Automática (Auto-Daub)' : language === 'es' ? '🎯 Marcación Automática' : '🎯 Auto-Marking (Auto-Daub)'}
        </label>

        <button 
          onClick={() => initializeCards(cardCount)} 
          className="btn btn-secondary" 
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          🔄 {language === 'pt' ? 'Gerar Novas Cartelas' : language === 'es' ? 'Gerar Nuevos Cartones' : 'Generate New Cards'}
        </button>
      </div>

      {/* Mobile Tab switcher (renders only when cardCount > 1 on small screens) */}
      {cardCount > 1 && (
        <div className="mobile-only" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {Array.from({ length: cardCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              style={{
                flex: '0 0 auto',
                padding: '8px 16px',
                fontSize: '13px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontWeight: 'bold',
                backgroundColor: activeTab === idx ? 'var(--accent-color)' : 'var(--bg-card-inner)',
                color: activeTab === idx ? '#fff' : 'var(--text-color)',
                boxShadow: activeTab === idx ? 'var(--shadow-md)' : 'none',
                cursor: 'pointer'
              }}
            >
              {language === 'pt' ? `Cartela ${idx + 1}` : language === 'es' ? `Cartón ${idx + 1}` : `Card ${idx + 1}`}
              {winningCards[idx] && ' 🏆'}
            </button>
          ))}
        </div>
      )}

      {/* Cards Display Grid */}
      <div 
        className="cards-container-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: cardCount === 1 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}
      >
        {cards.map((card, cardIdx) => {
          // In mobile tabbed view, hide cards that aren't the active tab
          const isTabActive = cardIdx === activeTab;
          const isWon = winningCards[cardIdx];
          const marked = markedStates[cardIdx] || {};

          return (
            <div 
              key={cardIdx} 
              className={`card-wrapper ${isTabActive ? 'active' : 'hidden-mobile'}`}
              style={{
                border: isWon ? '3px solid #10b981' : '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '16px',
                backgroundColor: 'var(--bg-card-inner)',
                position: 'relative',
                boxShadow: isWon ? '0 10px 25px -5px rgba(16, 185, 129, 0.4)' : 'var(--shadow-sm)',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Card Label and Individual Reset */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>
                  {language === 'pt' ? `CARTELA #${cardIdx + 1}` : language === 'es' ? `CARTÓN #${cardIdx + 1}` : `CARD #${cardIdx + 1}`}
                  {isWon && ' 🏆'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t.cardScore.replace('{count}', getMarkedCount(cardIdx).toString())}
                  </span>
                  <button 
                    onClick={() => handleResetCard(cardIdx)} 
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', opacity: 0.6 }}
                    title={t.clearCard}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Card Cells Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {['B', 'I', 'N', 'G', 'O'].map((letter, idx) => {
                  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#f97316', '#ef4444'];
                  return (
                    <div
                      key={letter}
                      style={{
                        backgroundColor: colors[idx],
                        color: '#fff',
                        fontWeight: 'bold',
                        padding: '6px 0',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '13px'
                      }}
                    >
                      {letter}
                    </div>
                  );
                })}

                {Array.from({ length: 5 }).map((_, rowIndex) =>
                  ['B', 'I', 'N', 'G', 'O'].map((col) => {
                    const isFree = col === 'N' && rowIndex === 2;
                    const key = `${col}-${rowIndex}`;
                    const val = card[col][rowIndex];
                    const isMarked = marked[key];
                    
                    // Check if this cell's number was drawn but not marked yet (hint indicator)
                    const isDrawnButUnmarked = !isFree && !isMarked && drawnBalls.includes(val);

                    return (
                      <button
                        key={key}
                        disabled={isWon}
                        onClick={() => toggleMark(cardIdx, col, rowIndex)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '8px',
                          border: isMarked 
                            ? '1px solid #10b981' 
                            : isDrawnButUnmarked 
                              ? '1.5px dashed var(--accent-color)'
                              : '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isFree ? '9px' : '16px',
                          fontWeight: '800',
                          cursor: isFree ? 'default' : 'pointer',
                          backgroundColor: isMarked 
                            ? '#10b981' 
                            : isDrawnButUnmarked 
                              ? 'rgba(99, 102, 241, 0.15)' 
                              : 'var(--bg-cell)',
                          color: isMarked ? '#fff' : 'var(--text-color)',
                          boxShadow: isMarked ? 'inset 0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.2s',
                          position: 'relative',
                          animation: isDrawnButUnmarked ? 'pulseGlow 2s infinite' : 'none'
                        }}
                      >
                        {isFree ? t.freeSpace : val}
                        
                        {/* Red dot indicator for drawn number hint */}
                        {isDrawnButUnmarked && (
                          <span style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-color)'
                          }} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* BINGO card overlay when this card wins */}
              {isWon && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(16, 185, 129, 0.92)',
                  borderRadius: '17px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  zIndex: 5,
                  animation: 'fadeIn 0.25s ease'
                }}>
                  <h3 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    BINGO!
                  </h3>
                  <button 
                    onClick={() => handleResetCard(cardIdx)} 
                    className="btn"
                    style={{ backgroundColor: '#fff', color: '#10b981', padding: '6px 16px', fontSize: '13px', border: 'none' }}
                  >
                    🔄 {t.newGame}
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .cards-container-grid {
            grid-template-columns: 1fr !important;
          }
          .hidden-mobile {
            display: none !important;
          }
          .active.card-wrapper {
            display: block !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
        @media (min-width: 641px) {
          .mobile-only {
            display: none !important;
          }
          .hidden-mobile {
            display: block !important;
          }
        }
      `}</style>

    </div>
  );
};

export default CardGenerator;
