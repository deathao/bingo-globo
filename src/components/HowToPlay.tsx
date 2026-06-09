import { translations } from '../translations';

type Props = {
  language: 'pt' | 'en' | 'es';
};

const HowToPlay = ({ language }: Props) => {
  const t = translations[language];

  return (
    <section id="how" className="info-section">
      <h2>{t.howToPlayTitle}</h2>
      <p>{t.howToPlayIntro}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        
        {/* Rules */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 className="accordion-title">{t.howToPlayRulesTitle}</h3>
          <ul style={{ paddingLeft: '20px', color: '#475569' }}>
            {t.howToPlayRules.map((rule, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>{rule}</li>
            ))}
          </ul>
        </div>

        {/* Patterns */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 className="accordion-title">{t.howToPlayPatternsTitle}</h3>
          <ul style={{ paddingLeft: '20px', color: '#475569' }}>
            {t.howToPlayPatterns.map((pat, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>{pat}</li>
            ))}
          </ul>
        </div>

        {/* Tips */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 className="accordion-title">{t.howToPlayTipsTitle}</h3>
          <ul style={{ paddingLeft: '20px', color: '#475569' }}>
            {t.howToPlayTips.map((tip, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Trivia */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 className="accordion-title">{t.howToPlayTriviaTitle}</h3>
          <ul style={{ paddingLeft: '20px', color: '#475569' }}>
            {t.howToPlayTrivia.map((triv, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>{triv}</li>
            ))}
          </ul>
        </div>

      </div>

      <div style={{ marginTop: '24px' }}>
        <h3 className="accordion-title">{t.howToPlayOnlineTitle}</h3>
        <p>{t.howToPlayOnline}</p>
        <p style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{t.howToPlayClosing}</p>
      </div>
    </section>
  );
};

export default HowToPlay;