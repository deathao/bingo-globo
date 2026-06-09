import { translations } from '../translations';

type Props = {
  language: 'pt' | 'en' | 'es';
};

const BingoHistory = ({ language }: Props) => {
  const t = translations[language];

  return (
    <section id="history" className="info-section">
      <h2>{t.bingoHistoryTitle}</h2>
      <p>{t.bingoHistoryText1}</p>
      <p>{t.bingoHistoryText2}</p>
      <p>{t.bingoHistoryText3}</p>
      <p>{t.bingoHistoryText4}</p>
    </section>
  );
};

export default BingoHistory;
