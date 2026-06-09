// Speech Announcer for Bingofy
// Leverages browser Speech Synthesis API to announce drawn balls in multiple languages.

const getLetter = (num: number): string => {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
};

class VoiceAnnouncer {
  private isEnabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.cancel();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public cancel() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public announceBall(num: number, lang: 'pt' | 'en' | 'es') {
    if (!this.isEnabled || !('speechSynthesis' in window)) return;

    this.cancel(); // Interrupt any ongoing speech immediately

    const letter = getLetter(num);
    let phrase = '';

    // Language phrases
    switch (lang) {
      case 'pt':
        phrase = `Letra ${letter}. ${num}.`;
        break;
      case 'en':
        phrase = `Letter ${letter}. ${num}.`;
        break;
      case 'es':
        phrase = `Letra ${letter}. ${num}.`;
        break;
      default:
        phrase = `${letter} ${num}`;
    }

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.volume = 1.0;
    utterance.rate = 0.95; // Slightly slower for clear pronunciation

    // Try to match a regional voice
    const voices = window.speechSynthesis.getVoices();
    let langCode = 'pt-BR';
    if (lang === 'en') langCode = 'en-US';
    if (lang === 'es') langCode = 'es-ES';

    const voice = voices.find((v) => v.lang.startsWith(langCode));
    if (voice) {
      utterance.voice = voice;
    }
    
    // Fallback language code mapping
    utterance.lang = langCode;

    window.speechSynthesis.speak(utterance);
  }
}

export const announcer = new VoiceAnnouncer();
