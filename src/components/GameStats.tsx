import React from 'react';
import { translations } from '../translations';

type Props = {
  drawnBalls: number[];
  language: 'pt' | 'en' | 'es';
};

const getLetterRange = (letter: string) => {
  switch (letter) {
    case 'B': return { min: 1, max: 15 };
    case 'I': return { min: 16, max: 30 };
    case 'N': return { min: 31, max: 45 };
    case 'G': return { min: 46, max: 60 };
    default: return { min: 61, max: 75 }; // O
  }
};

const getLetterColor = (letter: string) => {
  switch (letter) {
    case 'B': return '#3b82f6';
    case 'I': return '#22c55e';
    case 'N': return '#f59e0b';
    case 'G': return '#f97316';
    default: return '#ef4444'; // O
  }
};

export const GameStats = ({ drawnBalls, language }: Props) => {
  const t = translations[language];
  const totalDrawn = drawnBalls.length;
  const totalBalls = 75;
  const remaining = totalBalls - totalDrawn;
  const pct = Math.round((totalDrawn / totalBalls) * 100);

  const getDrawnInCol = (letter: string): number => {
    const { min, max } = getLetterRange(letter);
    return drawnBalls.filter((num) => num >= min && num <= max).length;
  };

  return (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Overview Telemetry */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-color)', margin: 0 }}>
            {t.historyTitle} (Telemetry)
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {remaining} {language === 'pt' ? 'bolas restantes' : language === 'es' ? 'bolas restantes' : 'balls remaining'}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-color)' }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Main progress bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${pct}%`, 
            height: '100%', 
            backgroundColor: 'var(--accent-color)', 
            borderRadius: '4px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}
        />
      </div>

      {/* Column Breakdowns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {['B', 'I', 'N', 'G', 'O'].map((letter) => {
          const drawn = getDrawnInCol(letter);
          const colPct = Math.round((drawn / 15) * 100);
          const color = getLetterColor(letter);

          return (
            <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '6px', 
                backgroundColor: color, 
                color: '#fff', 
                fontWeight: 'bold', 
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {letter}
              </span>
              
              {/* Progress bar per letter */}
              <div style={{ flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${colPct}%`, 
                    height: '100%', 
                    backgroundColor: color, 
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-color)', minWidth: '36px', textAlign: 'right' }}>
                {drawn}/15
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default GameStats;
