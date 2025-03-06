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
