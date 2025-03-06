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
