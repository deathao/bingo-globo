import { translations } from '../translations';

type Props = {
  language: 'pt' | 'en' | 'es';
};

const CardTips = ({ language }: Props) => {
  const t = translations[language];

  return (
    <section id="cardtips" className="info-section">
      <h2>{t.cardTipsTitle}</h2>
      <p style={{ marginBottom: '24px' }}>{t.cardTipsIntro}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {t.cardTipsSections.map((section: { subtitle: string; text: string }, index: number) => (
          <div className="glass-card" key={index} style={{ padding: '20px' }}>
            <h3 className="accordion-title">{section.subtitle}</h3>
            <p style={{ marginTop: '6px', fontSize: '15px' }}>{section.text}</p>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '32px', fontWeight: 'bold', color: 'var(--accent-color)' }}>{t.cardTipsClosing}</p>
    </section>
  );
};

export default CardTips;
