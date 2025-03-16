<script lang="ts">
    import LanguageSelect from "$lib/components/languageSelect.svelte";
    import Histogram from "$lib/components/histogram.svelte";
    import {languages} from "$lib/util/lang";
    import * as frequencyAnalysis from "$lib/util/frequencyAnalysis";
    import saveAs from "file-saver";
    import JSZip from "jszip";
    import TabMenu from "$lib/components/tabMenu.svelte";

    const MAX_FREQ_FOR_HISTOGRAM = 50;

    let text = $state("");
    let sampleSize = $state(1);
    let lang = $state(languages.en);
    let normalized = $state(true);
    let sorted = $state(false);
    let mode = $state(0);

    let frequencies = $state<Map<string, number>>(new Map()); // should only be used to calculate sortedFrequencies
    let sortedFrequencies = $derived(sorted ? frequencyAnalysis.sortFrequencies(frequencies) : frequencies);
    let showHistogram = $derived(sortedFrequencies.size <= MAX_FREQ_FOR_HISTOGRAM);

    let points = $derived([...sortedFrequencies.values()]);
    let labels = $derived([...sortedFrequencies.keys()]);
    let barLabels = $derived(normalized ?
        // for some reason, svelte thinks that outputFrequencies.values().map() is invalid statement inside $derived
        [...[...frequencyAnalysis.normalizeFrequencies(sortedFrequencies).values()]
            .map(v => v === 0 ? "" : (v >= 0.01 ? (v * 100).toFixed(0) : (v * 100).toFixed(2)) + "%")] :
        [...[...sortedFrequencies.values()].map(v => v === 0 ? "" : v.toString())]
    );


    function exportData(frequencies: Map<string, number>) {
        const type = mode === 0 ? "letter" : "word";
        saveAs(
            new Blob([JSON.stringify(Object.fromEntries(frequencies))], {type: "application/json"}),
            `${lang.name.toLowerCase()}_${sampleSize}_gram_${type}_frequencies.json`
        );
    }

    function generateStats() {
        const letterFreq = [];
        for (let i = 1; i <= 4; i++) {
            letterFreq.push(frequencyAnalysis.calculateLetterFrequencies(text, i, lang.alphabet));
        }
        const wordFreq = [];
        for (let i = 1; i <= 3; i++) {
            wordFreq.push(frequencyAnalysis.calculateWordFrequencies(text, i, lang.alphabet));
        }

        const data = [...letterFreq, ...wordFreq].map(f => frequencyAnalysis.normalizeFrequencies(f))
            .map(f => Object.fromEntries(f))
            .map(f => JSON.stringify(f));

        const filenames = [
            ...letterFreq.map((f, i) => `${lang.name.toLowerCase()}_${i + 1}_gram_letter_frequencies.json`),
            ...wordFreq.map((f, i) => `${lang.name.toLowerCase()}_${i + 1}_gram_word_frequencies.json`)
        ]

        const zip = new JSZip();
        data.forEach((d, i) => zip.file(filenames[i], d));
        zip.generateAsync({type: "blob"})
            .then(content => saveAs(content, `${lang.name.toLowerCase()}_frequencies.zip`));
    }
</script>

<TabMenu
    content={[
        {name: "Letters", func: () => frequencies = frequencyAnalysis.calculateLetterFrequencies(text, sampleSize, lang.alphabet)},
        {name: "Words", func: () => frequencies = frequencyAnalysis.calculateWordFrequencies(text, sampleSize, lang.alphabet)},
    ]}
    selected={mode}
/>

<textarea bind:value={text}></textarea>
<input type="number" min="1" step="1" bind:value={sampleSize}>
<LanguageSelect bind:value={lang} text={text}/>
<div>
    <input type="checkbox" bind:checked={normalized} name="normalized">
    <label for="normalized">Show percentages</label>
</div>
<div>
    <input type="checkbox" bind:checked={sorted} name="sorted">
    <label for="sorted">Sort</label>
</div>

{#if showHistogram}
    <Histogram
        height={200}
        points={points}
        labels={labels}
        barLabels={barLabels}
    />
{/if}
<button onclick={()=>exportData(sortedFrequencies)}>Export Data</button>
<button onclick={generateStats}>Generate Stats</button>

<style>
    textarea {
        width: 100%;
        height: 10rem;
        resize: vertical;
    }
</style>
