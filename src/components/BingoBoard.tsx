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

const BingoBoard = ({ drawnBalls, lastBall, onReset, language }: Props) => {
  const t = translations[language];

  const columns = {
    B: Array.from({ length: 15 }, (_, i) => i + 1),
    I: Array.from({ length: 15 }, (_, i) => i + 16),
    N: Array.from({ length: 15 }, (_, i) => i + 31),
    G: Array.from({ length: 15 }, (_, i) => i + 46),
    O: Array.from({ length: 15 }, (_, i) => i + 61),
  };

  const confirmReset = () => {
    if (window.confirm(t.confirmNewGame)) {
      onReset();
    }
  };

  return (
    <div style={{ textAlign: 'center', width: '400px', height: '800px'}}>
      {/* Frame de Último Número */}
      <div
        style={{
          border: '3px solid #000',
          borderRadius: '8px',
          padding: '10px',
          margin: '5px auto 10px',
          backgroundColor: '#000',
          color: '#fff',
          width: '400px',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '18px' }}>
          {lastBall
            ? t.lastBall
                .replace('{letter}', getLetter(lastBall))
                .replace('{number}', lastBall.toString())
            : t.noBall}
        </h2>
      </div>

      {/* Tabela de Números */}
      <div style={{ maxHeight: '1000px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {['B', 'I', 'N', 'G', 'O'].map((letter, idx) => {
            const colors = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'];
            return (
              <div
                key={letter}
                style={{
                  backgroundColor: colors[idx],
                  color: '#fff',
                  padding: '8px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                {letter}
              </div>
            );
          })}
          {Array.from({ length: 15 }).map((_, rowIndex) =>
            ['B', 'I', 'N', 'G', 'O'].map((letter) => {
              const number = columns[letter][rowIndex];
              return (
                <div
                  key={number}
                  style={{
                    padding: '6px',
                    backgroundColor: drawnBalls.includes(number) ? '#c92a2a' : '#f0f0f0',
                    color: drawnBalls.includes(number) ? '#fff' : '#333',
                    borderRadius: '4px',
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
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