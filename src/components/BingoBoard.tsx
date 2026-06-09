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

const BingoBoard = ({ drawnBalls, lastBall, language }: Props) => {
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
      default: return '#ef4444'; // 'O'
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Frame de Último Número */}
      <div
        className="glass-card"
        style={{
          padding: '16px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', trackingLetter: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
          {t.lastBall.split(':')[0]}
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
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                animation: 'pulseGlow 2s infinite'
              }}
            >
              {getLetter(lastBall)}
            </span>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-color)' }}>
              {lastBall}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-muted)', padding: '10px 0' }}>
            {t.noBall}
          </div>
        )}
      </div>

      {/* Tabela de Números */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '16px', 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {['B', 'I', 'N', 'G', 'O'].map((letter) => (
            <div
              key={letter}
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
          {Array.from({ length: 15 }).map((_, rowIndex) =>
            ['B', 'I', 'N', 'G', 'O'].map((letter) => {
              const number = columns[letter][rowIndex];
              const isDrawn = drawnBalls.includes(number);
              const isLast = lastBall === number;
              const colColor = getColColor(letter);

              return (
                <div
                  key={number}
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
                    border: isLast ? `2px solid #fff` : '1px solid rgba(226,232,240,0.3)',
                    transform: isLast ? 'scale(1.08)' : 'none',
                    zIndex: isLast ? 2 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {number}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BingoBoard;