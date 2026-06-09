import { translations } from '../translations';

type Props = {
  language: 'pt' | 'en' | 'es';
};

const About = ({ language }: Props) => {
  const t = translations[language];

  return (
    <section id="about" className="info-section">
      <h2>{t.aboutTitle}</h2>
      <p>{t.aboutText1}</p>
      <p>{t.aboutText2}</p>
    </section>
  );
};

export default About;