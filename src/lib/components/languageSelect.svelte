<script lang="ts">
    import {detectLanguage, languages} from "$lib/util/lang";

    let {
        rawKey = $bindable("auto"),
        key = $bindable("en"),
        value = $bindable(languages.en),
        text = $bindable(""), // text to detect language from
    } = $props();

    let autoDetected = $derived(detectLanguage(text));
    let customAlphabet = $state("");

    // detect language on text change
    $effect(() => {
        key = rawKey === "auto" ? autoDetected as string : rawKey;
        value = rawKey === "custom" ? {name: "Custom", alphabet: customAlphabet} : languages[key];
    });
</script>

<select bind:value={rawKey}>
    <option value="auto">Auto detect ({languages[autoDetected].name})</option>
    {#each Object.keys(languages) as lang (lang)}
        <option value={lang}>{languages[lang].name}</option>
    {/each}
    <option value="custom">Custom</option>
</select>

{#if rawKey === "custom"}
    <input type="text" bind:value={customAlphabet}>
{/if}
