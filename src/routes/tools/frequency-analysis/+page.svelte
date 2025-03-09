<script lang="ts">
    import LanguageSelect from "$lib/components/languageSelect.svelte";
    import Histogram from "$lib/components/histogram.svelte";
    import {languages} from "$lib/util/lang";
    import {calculateFrequencies, normalizeFrequencies, sortFrequencies} from "$lib/util/frequencyAnalysis";

    let text = $state("");
    let sampleSize = $state(1);
    let lang = $state(languages.en);
    let normalized = $state(true);
    let sorted = $state(false);

    let points = $state<number[]>([]);
    let labels = $state<string[]>([]);
    let barLabels = $state<string[]>([]);

    $effect(() => {
        let frequencies = calculateFrequencies(text, sampleSize, lang.alphabet);
        if (sorted) {
            frequencies = sortFrequencies(frequencies);
        }
        const outputFrequencies = normalized ? normalizeFrequencies(frequencies) : frequencies;

        points = [...frequencies.values()];
        labels = [...frequencies.keys()];
        if (normalized) {
            barLabels = [...outputFrequencies.values().map(v => v === 0 ? "" : (v >= 0.01 ? (v * 100).toFixed(0) : (v * 100).toFixed(2)) + "%")];
        } else {
            barLabels = [...frequencies.values().map(v => v === 0 ? "" : v.toString())];
        }
    });
</script>

<div class="frequency-analysis">
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
    <Histogram
        height={200}
        points={points}
        labels={labels}
        barLabels={barLabels}
    />

</div>

<style>
    div.frequency-analysis {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    textarea {
        width: 100%;
        height: 10rem;
        resize: vertical;
    }
</style>
