import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { sounds } from '../utils/sound';

type Props = {
  language: 'pt' | 'en' | 'es';
};

const generateColumnNumbers = (min: number, max: number, count: number): number[] => {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result.sort((a, b) => a - b);
};

const createNewCard = (): Record<string, number[]> => {
  return {
    B: generateColumnNumbers(1, 15, 5),
    I: generateColumnNumbers(16, 30, 5),
    N: generateColumnNumbers(31, 45, 5), // Index 2 will be replaced with free space
    G: generateColumnNumbers(46, 60, 5),
    O: generateColumnNumbers(61, 75, 5),
  };
};

const CardGenerator = ({ language }: Props) => {
  const t = translations[language];
  const [card, setCard] = useState<Record<string, number[]>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({ 'N-2': true }); // Center is free by default
  const [isWinner, setIsWinner] = useState(false);

  const handleNewCard = () => {
    setCard(createNewCard());
    setMarked({ 'N-2': true });
    setIsWinner(false);
  };

  useEffect(() => {
    handleNewCard();
  }, []);

  const toggleMark = (col: string, rowIndex: number) => {
    if (col === 'N' && rowIndex === 2) return; // Cannot unmark free space
    
    const key = `${col}-${rowIndex}`;
    setMarked((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      checkWinCondition(updated);
      return updated;
    });
  };

  const checkWinCondition = (currentMarked: Record<string, boolean>) => {
    // 5x5 Grid positions check
    const cols = ['B', 'I', 'N', 'G', 'O'];
    
    // Helper to check marked state
    const isPosMarked = (c: string, r: number) => {
      if (c === 'N' && r === 2) return true;
      return !!currentMarked[`${c}-${r}`];
    };

    // 1. Check rows
    for (let r = 0; r < 5; r++) {
      if (cols.every((c) => isPosMarked(c, r))) {
        triggerWin();
        return;
      }
    }

    // 2. Check cols
    for (const c of cols) {
      if (Array.from({ length: 5 }).every((_, r) => isPosMarked(c, r))) {
        triggerWin();
        return;
      }
    }

    // 3. Diagonals
    // Primary diagonal (B0, I1, N2, G3, O4)
    if (cols.every((c, idx) => isPosMarked(c, idx))) {
      triggerWin();
      return;
    }
    // Secondary diagonal (B4, I3, N2, G1, O0)
    if (cols.every((c, idx) => isPosMarked(c, 4 - idx))) {
      triggerWin();
      return;
    }

    // 4. Four corners (B0, B4, O0, O4)
    if (isPosMarked('B', 0) && isPosMarked('B', 4) && isPosMarked('O', 0) && isPosMarked('O', 4)) {
      triggerWin();
      return;
    }

    setIsWinner(false);
  };

  const triggerWin = () => {
    if (!isWinner) {
      setIsWinner(true);
      sounds.playWinChime();
    }
  };

  if (!card.B) return null;

  const totalMarkedCount = Object.values(marked).filter(Boolean).length - 1; // Subtract 1 for FREE space

  return (
    <div className="glass-card" style={{ padding: '24px', position: 'relative' }}>
      {isWinner && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(16, 185, 129, 0.9)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          zIndex: 10,
          animation: 'fadeIn 0.3s ease forwards'
        }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 10px 0', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>BINGO!</h2>
          <button 
            className="btn btn-primary"
            onClick={handleNewCard}
            style={{ backgroundColor: '#fff', color: '#10b981', border: 'none' }}
          >
            {t.generateCardBtn}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--text-color)' }}>{t.generateCardTitle}</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {t.cardScore.replace('{count}', totalMarkedCount.toString())}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleNewCard} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            🔄 {t.generateCardBtn}
          </button>
          <button onClick={() => setMarked({ 'N-2': true })} className="btn" style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#ef4444', color: '#fff' }}>
            🗑️ {t.clearCard}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {/* Header */}
        {['B', 'I', 'N', 'G', 'O'].map((letter, idx) => {
          const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#f97316', '#ef4444'];
          return (
            <div
              key={letter}
              style={{
                backgroundColor: colors[idx],
                color: '#fff',
                fontWeight: 'bold',
                padding: '12px 0',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                fontSize: '18px'
              }}
            >
              {letter}
            </div>
          );
        })}

        {/* Rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) =>
          ['B', 'I', 'N', 'G', 'O'].map((col) => {
            const isFree = col === 'N' && rowIndex === 2;
            const key = `${col}-${rowIndex}`;
            const val = card[col][rowIndex];
            const isMarked = marked[key];

            return (
              <button
                key={key}
                disabled={isWinner}
                onClick={() => toggleMark(col, rowIndex)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '12px',
                  border: '2px solid rgba(226, 232, 240, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isFree ? '10px' : '20px',
                  fontWeight: 'bold',
                  cursor: isFree ? 'default' : 'pointer',
                  backgroundColor: isMarked ? '#10b981' : '#fff',
                  color: isMarked ? '#fff' : 'var(--text-color)',
                  boxShadow: isMarked 
                    ? 'inset 0 2px 4px rgba(0,0,0,0.2), 0 4px 6px -1px rgba(16, 185, 129, 0.4)' 
                    : '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isMarked ? 'scale(0.96)' : 'none',
                  outline: 'none',
                }}
              >
                {isFree ? t.freeSpace : val}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CardGenerator;
