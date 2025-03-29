export function calculateLetterFrequencies(text: string, sampleSize: number, alphabet: string): Map<string, number> {
    const freqMap = new Map<string, number>();
    const textArr = text.toLowerCase().split('');

    // fill the map with the alphabet
    if (sampleSize === 1) {
        for (const char of alphabet) {
            freqMap.set(char, 0);
        }
    }

    // iterate over the text and count the frequency of samples
    for (let i = 0; i < textArr.length - sampleSize + 1; i++) {
        const sampleArr = textArr.slice(i, i + sampleSize);
        if (sampleArr.some((char) => !alphabet.includes(char))) {
            continue;
        }

        const sampleStr = sampleArr.join('');
        const count = freqMap.get(sampleStr) || 0;
        freqMap.set(sampleStr, count + 1);
    }

    return freqMap;
}

// characters that are not part of the alphabet but are still considered valid
const SPECIAL_WORD_CHARACTERS = "-'";
// characters that have different variants but should be treated as the same
const REPLACE_WORD_CHARACTERS: { [key: string]: string } = {
    '`': "'",
    '’': "'",
};

export function calculateWordFrequencies(text: string, sampleSize: number, alphabet: string): Map<string, number> {
    const freqMap = new Map<string, number>();

    text = text
        .toLowerCase()
        .replaceAll(/\s+/g, ' ')
        .trim();

    for (const [char, repl] of Object.entries(REPLACE_WORD_CHARACTERS)) {
        text = text.replaceAll(char, repl);
    }

    const textArr = text
        .split('')
        .filter(c => alphabet.includes(c) || SPECIAL_WORD_CHARACTERS.includes(c) || c === ' ')
        .join('')
        .split(/\s+/)
        .filter(Boolean);

    for (let i = 0; i < textArr.length - sampleSize + 1; i++) {
        const sample = textArr.slice(i, i + sampleSize).join(' ');
        const count = freqMap.get(sample) || 0;
        freqMap.set(sample, count + 1);
    }

    return freqMap;
}

export function normalizeFrequencies(freqMap: Map<string, number>): Map<string, number> {
    const total = Array.from(freqMap.values()).reduce((acc, count) => acc + count, 0);
    const freqMapCopy = new Map(freqMap);

    if (total === 0) {
        return freqMapCopy;
    }

    for (const [key, count] of freqMap.entries()) {
        freqMapCopy.set(key, count / total);
    }

    return freqMapCopy;
}

export function sortFrequencies(freqMap: Map<string, number>): Map<string, number> {
    return new Map([...freqMap.entries()].sort((a, b) => b[1] - a[1]));
}

export async function scoreText(text: string, language: string): Promise<number | null> {
    const result = await fetch('/api/score-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({language, text}),
    });

    if (!result.ok) {
        return null;
    }

    try {
        const {score} = await result.json();
        return score;
    } catch {
        return null;
    }
}
