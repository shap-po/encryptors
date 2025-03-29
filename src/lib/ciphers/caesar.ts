import {scoreText} from "$lib/util/frequencyAnalysis";

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

export async function crack(text: string, language: string, alphabet: string): Promise<number> {
    let bestShift = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < alphabet.length; i++) {
        const decrypted = decrypt(text, i, alphabet);
        const score = await scoreText(decrypted, language);
        console.log(`Shift: ${i}, Score: ${score}`);
        if (score === null) {
            continue;
        }
        if (score > bestScore) {
            bestScore = score;
            bestShift = i;
        }
    }

    return bestShift;
}

export async function analyze(text: string, language: string, alphabet: string): Promise<string> {
    const variants = [];
    for (let i = 1; i < alphabet.length; i++) {
        variants.push(`${i}: ${decrypt(text, i, alphabet)}`);
    }

    const shift = await crack(text, language, alphabet);
    const decrypted = decrypt(text, shift, alphabet);

    return `Best shift: ${shift}
Decrypted text: ${decrypted}


All variants:
${variants.join('\n')}`;
}
