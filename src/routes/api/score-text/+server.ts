import {json} from '@sveltejs/kit';
import {read} from '$app/server';
import {calculateLetterFrequencies} from "$lib/util/frequencyAnalysis";
import {languages} from "$lib/util/lang";

/**
 * Loads the letter frequencies for a given language and sample size
 * @param language
 * @param sampleSize
 */
async function loadFrequencies(language: string, sampleSize: number): Promise<Map<string, number> | null> {
    // make sure the language exists so we don't try to load non-existent files
    if (!languages[language]) {
        return null;
    }

    let freqCsv;
    try {
        freqCsv = await read(`/src/data/frequencies/lang/${language}/${sampleSize}_gram_letter_frequencies.csv`).text();
    } catch {
        return null;
    }

    const freqMap = new Map<string, number>();
    for (const [key, value] of freqCsv.split('\n').map((line) => line.split(','))) {
        freqMap.set(key, Number(value));
    }

    // calc log10 of each value
    for (const [key, value] of freqMap.entries()) {
        freqMap.set(key, Math.log10(value / freqMap.size));
    }

    return freqMap;
}


/**
 * Score the text based on the letter frequencies. The higher the score, the more likely the text is valid.
 * @param request - the request object, containing the language key and text
 * @constructor
 */
export async function POST({request}): Promise<Response> {
    // parse the request body
    let requestJson;
    try {
        requestJson = await request.json();
    } catch {
        return json({error: 'Invalid JSON'}, {status: 400});
    }

    const {language: language, text} = requestJson;

    // validate the parameters
    if (language === undefined) {
        return json({error: 'Missing "language" parameter'}, {status: 400});
    }
    if (text === undefined) {
        return json({error: 'Missing "text" parameter'}, {status: 400});
    }
    if (typeof language !== 'string') {
        return json({error: 'Invalid "language" parameter'}, {status: 400});
    }
    if (typeof text !== 'string') {
        return json({error: 'Invalid "text" parameter'}, {status: 400});
    }
    if (!languages[language]) {
        return json({error: 'Invalid language'}, {status: 400});
    }

    const scores: number[] = [];

    for (let i = 1; i <= 3; i++) {
        const freqMap = await loadFrequencies(language, i);
        if (freqMap === null) {
            continue;
        }

        const floor = Math.log10(0.01 / freqMap.size);
        const textFreqMap = calculateLetterFrequencies(text, i, languages[language].alphabet);

        let score = 0;
        for (const [key, value] of textFreqMap.entries()) {
            score += value * (freqMap.get(key) || floor);
        }

        scores.push(score);
    }

    const result = {
        score: scores.reduce((acc, score) => acc + score, 0),
    };

    return json(result);
}
