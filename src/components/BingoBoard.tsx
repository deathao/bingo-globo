import { translations } from '../translations';

type Props = {
  drawnBalls: number[];
  lastBall: number | null;
  onReset: () => void;
  language: 'pt' | 'en' | 'es';
};

const getLetter = (num: number): string => {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
};

export const BingoBoard = ({ drawnBalls, lastBall, language }: Props) => {
  const t = translations[language];

  const columns = {
    B: Array.from({ length: 15 }, (_, i) => i + 1),
    I: Array.from({ length: 15 }, (_, i) => i + 16),
    N: Array.from({ length: 15 }, (_, i) => i + 31),
    G: Array.from({ length: 15 }, (_, i) => i + 46),
    O: Array.from({ length: 15 }, (_, i) => i + 61),
  };

  const getColColor = (letter: string) => {
    switch (letter) {
      case 'B': return '#3b82f6';
      case 'I': return '#22c55e';
      case 'N': return '#f59e0b';
      case 'G': return '#f97316';
      default: return '#ef4444'; // O
    }
  };

  return (
    <div 
      style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px' }}
      aria-label={language === 'pt' ? 'Painel do Sorteador' : language === 'es' ? 'Tablero de Sorteo' : 'Caller Master Board'}
    >
      
      {/* Last Ball Announced (Live Region for screen readers) */}
      <div
        className="glass-card"
        style={{
          padding: '16px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>
          {language === 'pt' ? 'ÚLTIMA BOLA SORTEADA' : language === 'es' ? 'ÚLTIMA BOLA SORTEADA' : 'LAST BALL DRAWN'}
        </div>
        {lastBall ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: getColColor(getLetter(lastBall)),
                color: '#fff',
                fontSize: '28px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px -2px rgba(0, 0, 0, 0.25)',
                animation: 'pulseGlow 2s infinite'
              }}
              aria-hidden="true"
            >
              {getLetter(lastBall)}
            </span>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-color)' }}>
              {lastBall}
            </span>
            <span className="sr-only">
              {t.lastBall.replace('{letter}', getLetter(lastBall)).replace('{number}', lastBall.toString())}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', padding: '8px 0' }}>
            {t.noBall}
          </div>
        )}
      </div>

      {/* Grid Board of 75 Numbers */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '16px', 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div 
          role="grid" 
          aria-readonly="true"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}
        >
          {/* Header Row */}
          <div role="row" style={{ display: 'contents' }}>
            {['B', 'I', 'N', 'G', 'O'].map((letter) => (
              <div
                key={letter}
                role="columnheader"
                style={{
                  backgroundColor: getColColor(letter),
                  color: '#fff',
                  padding: '10px 0',
                  fontWeight: '800',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontSize: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                {letter}
              </div>
            ))}
          </div>

          {/* Numbers Rows */}
          {Array.from({ length: 15 }).map((_, rowIndex) => (
            <div key={rowIndex} role="row" style={{ display: 'contents' }}>
              {['B', 'I', 'N', 'G', 'O'].map((letter) => {
                const number = columns[letter][rowIndex];
                const isDrawn = drawnBalls.includes(number);
                const isLast = lastBall === number;
                const colColor = getColColor(letter);

                const a11yLabel = language === 'pt' 
                  ? `Número ${letter} ${number}. ${isDrawn ? 'Sorteado' : 'Ainda não sorteado'}.`
                  : language === 'es'
                    ? `Número ${letter} ${number}. ${isDrawn ? 'Sorteado' : 'No sorteado'}.`
                    : `Number ${letter} ${number}. ${isDrawn ? 'Drawn' : 'Not drawn'}.`;

                return (
                  <div
                    key={number}
                    role="gridcell"
                    aria-label={a11yLabel}
                    aria-selected={isDrawn}
                    tabIndex={0}
                    style={{
                      padding: '8px 0',
                      backgroundColor: isDrawn ? colColor : 'rgba(241, 245, 249, 0.6)',
                      color: isDrawn ? '#fff' : 'var(--text-color)',
                      borderRadius: '8px',
                      height: '38px',
                      fontSize: '15px',
                      fontWeight: isDrawn ? 'bold' : '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isLast 
                        ? `0 0 12px ${colColor}, inset 0 0 4px rgba(255,255,255,0.6)`
                        : 'none',
                      border: isLast ? `2.5px solid #fff` : '1px solid rgba(226,232,240,0.3)',
                      transform: isLast ? 'scale(1.08)' : 'none',
                      zIndex: isLast ? 2 : 1,
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {number}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BingoBoard;