import React, { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallbackText: string;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebGL / Three.js Render Crash:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          minHeight: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated 2D Fallback SVG Globe */}
          <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '24px' }}>
            {/* Spinning Golden Cage Ring */}
            <svg 
              viewBox="0 0 100 100" 
              style={{
                width: '100%',
                height: '100%',
                animation: 'logo-spin infinite 6s linear',
                filter: 'drop-shadow(0 0 8px #f59e0b)'
              }}
            >
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="12 6" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="#f59e0b" strokeWidth="2" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="#f59e0b" strokeWidth="2" />
            </svg>
            
            {/* Floating balls bouncing inside */}
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '25%',
              width: '50%',
              height: '50%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              alignContent: 'center',
              justifyContent: 'center'
            }}>
              {[
                { color: '#3b82f6', anim: 'bounce 1.2s infinite alternate' },
                { color: '#22c55e', anim: 'bounce 1.5s infinite alternate 0.2s' },
                { color: '#f59e0b', anim: 'bounce 0.9s infinite alternate 0.4s' },
                { color: '#ef4444', anim: 'bounce 1.4s infinite alternate 0.1s' },
              ].map((b, i) => (
                <span 
                  key={i} 
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: b.color,
                    animation: b.anim,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                />
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#f59e0b' }}>
            WebGL Fallback Mode
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '320px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
            {this.fallbackText}
          </p>

          <button 
            onClick={this.handleReset} 
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '10px' }}
          >
            🔄 Reload 3D Globe
          </button>

          <style>{`
            @keyframes bounce {
              from { transform: translateY(6px); }
              to { transform: translateY(-6px); }
            }
          `}</style>
        </div>
      );
    }

    return this.children;
  }
}
export default ErrorBoundary;
