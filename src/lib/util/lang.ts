export interface Language {
    name: string;
    alphabet: string;
}

export const languages: { [key: string]: Language } = {
    'en': {
        name: 'English',
        alphabet: 'abcdefghijklmnopqrstuvwxyz',
    },
    'uk': {
        name: 'Ukrainian',
        alphabet: 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя',
    },
} as const;

export type LanguageKey = keyof typeof languages;
export type Alphabet = typeof languages[LanguageKey]['alphabet'];

export function detectLanguage(text: string): LanguageKey {
    let bestScore = -1;
    let bestLang = '';
    const textArr = text.toLowerCase().split('');

    for (const lang in languages) {
        const language = languages[lang as LanguageKey];
        const {alphabet} = language;
        const score = textArr.reduce((acc, char) => {
            if (alphabet.includes(char)) {
                return acc + 1;
            }
            return acc;
        }, 0);

        if (score > bestScore) {
            bestScore = score;
            bestLang = lang;
        }
    }

    return bestLang as LanguageKey;
}
