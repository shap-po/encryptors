import {languages} from "$lib/util/lang";

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

/**
 * Loads the letter frequencies for a given language and sample size
 */
export async function loadFrequencyMap(language: string, sampleSize: number): Promise<Map<string, number> | null> {
    // make sure the language exists so we don't try to load non-existent files
    if (!languages[language]) {
        return null;
    }

    let freq;
    try {
        freq = await import(/* @vite-ignore */ `/src/data/frequencies/lang/${language}/${sampleSize}_gram_letter_frequencies.json`, {with: {type: "json"}} )
            .then(m => m.default) as { [key: string]: number };
    } catch {
        return null;
    }

    const freqMap = new Map<string, number>();
    for (const [key, value] of Object.entries(freq)) {
        freqMap.set(key, value);
    }

    return freqMap;
}

/**
 * Loads the scoring (log10) letter frequencies for a given language and sample size
 */
async function loadScoringFrequencyMap(language: string, sampleSize: number): Promise<Map<string, number> | null> {
    const freqMap = await loadFrequencyMap(language, sampleSize);
    if (freqMap === null) {
        return null;
    }

    // calc log10 of each value
    for (const [key, value] of freqMap.entries()) {
        freqMap.set(key, Math.log10(value / freqMap.size));
    }

    return freqMap;
}

async function loadScoringFrequencyMaps(language: string): Promise<(Map<string, number> | null)[]> {
    return await Promise.all([1, 2, 3].map((i) => loadScoringFrequencyMap(language, i)));
}

export function _scoreText(freqMaps: (Map<string, number> | null)[], text: string, language: string): number {
    const scores: number[] = [];

    for (let i = 0; i < freqMaps.length; i++) {
        const freqMap = freqMaps[i];
        if (freqMap === null) {
            continue;
        }

        const floor = Math.log10(0.01 / freqMap.size);
        const textFreqMap = calculateLetterFrequencies(text, i + 1, languages[language].alphabet);

        let score = 0;
        for (const [key, value] of textFreqMap.entries()) {
            score += value * (freqMap.get(key) || floor);
        }

        scores.push(score);
    }

    return scores.reduce((acc, score) => acc + score, 0);
}

export async function scoreText(language: string, text: string): Promise<number> {
    const freqMaps = await loadScoringFrequencyMaps(language);
    return _scoreText(freqMaps, text, language);
}

export type ScoreResult = {
    best: number;
    scores: number[];
}

export function _scoreTexts(freqMaps: (Map<string, number> | null)[], texts: string[], language: string): ScoreResult {
    const scores = texts.map((text) => _scoreText(freqMaps, text, language));
    let best = 0;
    for (let i = 1; i < scores.length; i++) {
        if (scores[i] > scores[best]) {
            best = i;
        }
    }

    return {
        best,
        scores,
    };
}

export async function scoreTexts(language: string, texts: string[]): Promise<ScoreResult> {
    const freqMaps = await loadScoringFrequencyMaps(language);
    return _scoreTexts(freqMaps, texts, language);
}
