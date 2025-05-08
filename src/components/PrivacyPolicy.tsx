import { translations } from '../translations';

type Props = {
  language: 'pt' | 'en' | 'es';
};

const PrivacyPolicy = ({ language }: Props) => {
  const t = translations[language];

  return (
    <section id="privacy" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>{t.privacyTitle}</h2>
      <p>{t.privacyText1}</p>
      <p>{t.privacyText2}</p>
    </section>
  );
};

export default PrivacyPolicy;