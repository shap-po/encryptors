import {scoreText, scoreTexts, _scoreText, _scoreTexts} from "$lib/util/frequencyAnalysis";

function use(text: string, key: string, alphabet: string, op: number): string {
    let output = "";
    const cleanKey = key.toLowerCase().split('').filter(char => alphabet.includes(char));

    if (cleanKey.length === 0) {
        return text;
    }

    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        const index = alphabet.indexOf(char.toLowerCase());

        if (index === -1) {
            output += char;
            continue;
        }

        const keyChar = cleanKey[keyIndex];
        const keyIndexIncrement = alphabet.indexOf(keyChar) * op;

        let newIndex = (index + keyIndexIncrement) % alphabet.length;
        if (newIndex < 0) {
            newIndex += alphabet.length;
        }
        const newChar = alphabet.charAt(newIndex);

        output += char === char.toUpperCase() ? newChar.toUpperCase() : newChar;
        keyIndex = (keyIndex + 1) % cleanKey.length;
    }

    return output;
}

export function encrypt(text: string, key: string, alphabet: string): string {
    return use(text, key, alphabet, 1);
}

export function decrypt(text: string, key: string, alphabet: string): string {
    return use(text, key, alphabet, -1);
}

export async function analyze(text: string, language: string, alphabet: string): Promise<string> {
    const cleanedText = text.toLowerCase().replace(new RegExp(`[^${alphabet}]`, 'g'), '');
    if (cleanedText.length === 0) {
        return "";
    }

    const possibleKeyLengths = findKeyLength(cleanedText);

    const results = await Promise.all(
        possibleKeyLengths.map(async (l) => {
            const key = await findKey(cleanedText, l.length, language, alphabet);
            if (!key) {
                return null
            }

            const decrypted = decrypt(text, key, alphabet);
            const score = await scoreText(decrypted, language) || 0;
            return {key, decrypted, score};
        })
    ).then(values => values.filter(value => value !== null));

    if (results.length === 0) {
        return ""; // scoring failed
    }

    // Sort results by score; if scores are equal, the shorter key length should come first
    results.sort((a, b) => {
        if (a.score !== b.score) {
            return b.score - a.score;
        }

        return a.key.length - b.key.length;
    });

    // Format results
    let output = "";

    // Show probable key lengths with their index of coincidence
    output += "Probable key lengths (by Index of Coincidence):\n";
    possibleKeyLengths.forEach(({length, ic}) => {
        output += `Length ${length}: IC = ${ic.toFixed(4)}\n`;
    });
    output += "\n";

    // Show detailed results for the most likely keys
    output += "Top solutions:\n\n";
    results.forEach(({key, decrypted, score}, index) => {
        output += `Solution ${index + 1}:\n`;
        output += `Key length: ${key.length}\n`;
        output += `Key: ${key}\n`;
        output += `Score: ${score.toFixed(4)}\n`;
        output += `Decrypted text (preview): ${decrypted.substring(0, 100)}${decrypted.length > 100 ? '...' : ''}\n\n`;
    });

    // Show full decryption for the best match
    if (results.length > 0) {
        output += "Best solution full decryption:\n";
        output += results[0].decrypted;
    }

    return output;
}

function findKeyLength(text: string): { length: number, ic: number }[] {
    const results: { length: number, ic: number }[] = [];
    const maxLength = Math.min(
        Math.floor(text.length / 3),
        20,
    );

    for (let length = 1; length <= maxLength; length++) {
        const sequences = splitIntoSequences(text, length);
        const avgIC = sequences.reduce((acc, seq) => acc + calculateIC(seq), 0) / sequences.length;
        results.push({length, ic: avgIC});
    }

    return results.sort((a, b) => b.ic - a.ic).slice(0, 5);
}

function splitIntoSequences(text: string, keyLength: number): string[] {
    const sequences: string[] = Array(keyLength).fill('');

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        sequences[i % keyLength] += char;
    }

    return sequences;
}

function calculateIC(text: string): number {
    const n = text.length;
    if (n <= 1) {
        return 0;
    }

    const counts: Map<string, number> = new Map();
    for (const char of text.toLowerCase()) {
        counts.set(char, (counts.get(char) || 0) + 1);
    }

    let sum = 0;
    for (const count of counts.values()) {
        sum += count * (count - 1);
    }

    return sum / (n * (n - 1));
}


async function findKey(text: string, keyLength: number, language: string, alphabet: string): Promise<string | null> {
    const sequences = splitIntoSequences(text, keyLength);
    let key = '';

    for (let i = 0; i < keyLength; i++) {
        const sequence = sequences[i];
        const shifts = [];

        for (let shift = 0; shift < alphabet.length; shift++) {
            const decrypted = decrypt(sequence, alphabet[shift], alphabet);
            shifts.push(decrypted);
        }

        const result = await scoreTexts(language, shifts);
        if (result) {
            key += alphabet[result.best];
        } else {
            return null; // language does not support scoring
        }
    }

    return key;
}
