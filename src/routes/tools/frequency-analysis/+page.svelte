<script lang="ts">
    import LanguageSelect from "$lib/components/languageSelect.svelte";
    import Histogram from "$lib/components/histogram.svelte";
    import {languages} from "$lib/util/lang";
    import * as frequencyAnalysis from "$lib/util/frequencyAnalysis";
    import saveAs from "file-saver";
    import JSZip from "jszip";
    import TabMenu from "$lib/components/tabMenu.svelte";
    import PlaintextInput from "$lib/components/plaintextInput.svelte";
    import FormatSelect, {formats} from "$lib/components/formatSelect";
    import {Button, ButtonGroup, Checkbox, Input} from 'flowbite-svelte';

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

    let format = $state.raw(formats[0].value);

    function exportData(frequencies: Map<string, number>) {
        const type = mode === 0 ? "letter" : "word";
        saveAs(
            new Blob([format.func(frequencies)], {type: format.type}),
            `${lang.name.toLowerCase()}_${sampleSize}_gram_${type}_frequencies.${format.extension}`
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

        const data = [...letterFreq, ...wordFreq]
            .map(frequencyAnalysis.sortFrequencies)
            .map(format.func);

        const filenames = [
            ...letterFreq.map((f, i) => `${i + 1}_gram_letter_frequencies.${format.extension}`),
            ...wordFreq.map((f, i) => `${i + 1}_gram_word_frequencies.${format.extension}`)
        ]

        const zip = new JSZip();
        data.forEach((d, i) => zip.file(filenames[i], d));
        zip.generateAsync({type: "blob"})
            .then(content => saveAs(content, `${lang.name.toLowerCase()}_frequencies.zip`));
    }
</script>

<svelte:head>
    <title>Frequency analysis</title>
</svelte:head>

<TabMenu
    content={[
        {name: "Letters", func: () => frequencies = frequencyAnalysis.calculateLetterFrequencies(text, sampleSize, lang.alphabet)},
        {name: "Words", func: () => frequencies = frequencyAnalysis.calculateWordFrequencies(text, sampleSize, lang.alphabet)},
    ]}
    selected={mode}
/>

<PlaintextInput bind:value={text} placeholder="Put text to analyse here or upload a file instead"/>
<Input type="number" min="1" step="1" bind:value={sampleSize}/>
<LanguageSelect bind:value={lang} text={text}/>

<Checkbox bind:checked={normalized}>Show percentages</Checkbox>
<Checkbox bind:checked={sorted}>Sort</Checkbox>

{#if showHistogram}
    <Histogram
        height={200}
        points={points}
        labels={labels}
        barLabels={barLabels}
    />
{/if}

<div class="flex flex-col justify-center items-center">
    <div>
        <FormatSelect bind:value={format} class="mb-1"/>
        <ButtonGroup class="justify-center">
            <Button onclick={()=>exportData(sortedFrequencies)}>Export Data</Button>
            <Button onclick={generateStats} title="Generate a zip-file with 1-4-gram word and letter frequencies">
                Generate Stats
            </Button>
        </ButtonGroup>
    </div>
</div>
