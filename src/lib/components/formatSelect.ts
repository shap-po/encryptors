import FormatSelect from "./formatSelect.svelte";

export default FormatSelect;

export type Format = {
    func: (data: Map<string, number>) => string;
    extension: string;
    type: string;
};

type FormatEntry = {
    name: string;
    value: Format;
}

export const formats: FormatEntry[] = [
    {
        name: "JSON",
        value: {
            func: (data) => JSON.stringify(Object.fromEntries(data)),
            extension: "json",
            type: "application/json",
        }
    },
    {
        name: "CSV",
        value: {
            func: (data) => {
                let output = "";
                for (const [letter, count] of data) {
                    output += `${letter},${count}\n`;
                }
                return output;
            },
            extension: "csv",
            type: "text/csv",
        }
    },
];

