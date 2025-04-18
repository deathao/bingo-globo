import './App.css';
import { useState } from 'react';
import GloboRapier from './components/GloboRapier';

function App() {
  const allBalls = Array.from({ length: 75 }, (_, i) => i + 1);
  const [remainingBalls, setRemainingBalls] = useState<number[]>(allBalls);
  const [drawnBalls, setDrawnBalls] = useState<number[]>([]);

  const handleDraw = () => {
    if (remainingBalls.length === 0) return;
    const randomIndex = Math.floor(Math.random() * remainingBalls.length);
    const drawnNumber = remainingBalls[randomIndex];
    setDrawnBalls((prev) => [drawnNumber, ...prev]);
    setRemainingBalls((prev) => prev.filter((n) => n !== drawnNumber));
  };

  return (
    <div
      style={{
        display: 'flex',
        padding: '20px',
        gap: '40px',
        alignItems: 'flex-start',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ flex: 1, minWidth: '500px' }}>
        <h2 style={{ color: '#222' }}>Globo de Bingo (Rapier)</h2>
        <GloboRapier drawnBalls={drawnBalls} />
        <button
          onClick={handleDraw}
          style={{
            marginTop: '10px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: '#fff',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          Sortear Bola
        </button>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: '#fff',
          color: '#333',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginBottom: '20px' }}>Bolas Sorteadas</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '10px',
          }}
        >
          {drawnBalls.map((num, index) => (
            <div
              key={index}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  'inset -2px -2px 4px rgba(255,255,255,0.3), inset 2px 2px 4px rgba(0,0,0,0.3)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {num}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;