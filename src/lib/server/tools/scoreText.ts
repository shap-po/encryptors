import {languages} from "$lib/util/lang";
import {read} from "$app/server";
import {calculateLetterFrequencies} from "$lib/util/frequencyAnalysis";

/**
 * Loads the letter frequencies for a given language and sample size
 * @param language
 * @param sampleSize
 */
export async function loadFrequencyMap(language: string, sampleSize: number): Promise<Map<string, number> | null> {
    // make sure the language exists so we don't try to load non-existent files
    if (!languages[language]) {
        return null;
    }

    let freq;
    try {
        freq = await read(`/src/data/frequencies/lang/${language}/${sampleSize}_gram_letter_frequencies.json`).text();
    } catch {
        return null;
    }
    freq = JSON.parse(freq) as { [key: string]: number };

    const freqMap = new Map<string, number>();
    for (const [key, value] of Object.entries(freq)) {
        freqMap.set(key, Number(value));
    }

    // calc log10 of each value
    for (const [key, value] of freqMap.entries()) {
        freqMap.set(key, Math.log10(value / freqMap.size));
    }

    return freqMap;
}

export async function loadFrequencyMaps(language: string): Promise<(Map<string, number> | null)[]> {
    return await Promise.all([1, 2, 3].map((i) => loadFrequencyMap(language, i)));
}

export function scoreText(freqMaps: (Map<string, number> | null)[], text: string, language: string): number {
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

export async function loadAndScoreText(language: string, text: string): Promise<number> {
    const freqMaps = await loadFrequencyMaps(language);
    return scoreText(freqMaps, text, language);
}

export type ScoreResult = {
    best: number;
    scores: number[];
}

export function scoreTexts(freqMaps: (Map<string, number> | null)[], texts: string[], language: string): ScoreResult {
    const scores = texts.map((text) => scoreText(freqMaps, text, language));
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

export async function loadAndScoreTexts(language: string, texts: string[]): Promise<ScoreResult> {
    const freqMaps = await loadFrequencyMaps(language);
    return scoreTexts(freqMaps, texts, language);
}
