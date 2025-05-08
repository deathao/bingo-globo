import { translations } from '../translations';

type Props = {
  language: 'pt' | 'en' | 'es';
};

const HowToPlay = ({ language }: Props) => {
  const t = translations[language];

  return (
    <section id="how-to-play" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>{t.howToPlayTitle}</h2>
      <p>{t.howToPlayText1}</p>
      <p>{t.howToPlayText2}</p>
    </section>
  );
};

export default HowToPlay;