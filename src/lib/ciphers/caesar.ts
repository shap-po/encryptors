import {scoreTexts} from "$lib/util/frequencyAnalysis";

export function encrypt(text: string, shift: number, alphabet: string): string {
    let output = "";

    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        const index = alphabet.indexOf(char.toLowerCase());

        if (index === -1) {
            output += char;
            continue;
        }

        let newIndex = (index + shift) % alphabet.length;
        if (newIndex < 0) {
            newIndex += alphabet.length;
        }
        const newChar = alphabet.charAt(newIndex);

        output += char === char.toUpperCase() ? newChar.toUpperCase() : newChar;
    }

    return output;
}

export function decrypt(text: string, shift: number, alphabet: string): string {
    return encrypt(text, -shift, alphabet);
}

export async function analyze(text: string, language: string, alphabet: string): Promise<string> {
    const variants = [];
    for (let i = 0; i < alphabet.length; i++) {
        variants.push(decrypt(text, i, alphabet));
    }

    const result = await scoreTexts(variants, language);
    if (result === null) {
        return `Failed to automatically determine the best shift. Here are all the variants:
${variants.map((variant, i) => `${i} - ${variant}`).join('\n')}`;
    }

    const shift = result.best;
    const decrypted = variants[shift];

    const sortedVariants = variants
        .map((variant, i) => ({variant, shift: i, score: result.scores[i]}))
        .sort((a, b) => b.score - a.score)
        .map(({variant, shift, score}) => `${shift} (${score}) - ${variant}`);

    return `Best shift: ${shift}
Decrypted text: ${decrypted}


All variants sorted by score:
${sortedVariants.join('\n')}`;
}
