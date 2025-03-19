<script lang="ts">
    import {detectLanguage, type Language, languages} from "$lib/util/lang";
    import {Select} from "flowbite-svelte";

    let {
        rawKey = $bindable("auto"),
        key = $bindable("en"),
        value = $bindable(languages.en),
        text = $bindable(""), // text to detect language from
    }: {
        rawKey?: string,
        key?: string,
        value?: Language,
        text?: string,
    } = $props();

    let autoDetected = $derived(detectLanguage(text));
    let customAlphabet = $state("");
    let values = $derived([
        {value: "auto", name: `Auto detect (${languages[autoDetected].name})`},
        ...Object.keys(languages).map(k => {
            return {value: k, name: languages[k].name}
        }),
        {value: "custom", name: "Custom"},
    ]);

    // detect language on text change
    $effect(() => {
        key = rawKey === "auto" ? autoDetected as string : rawKey;
        value = rawKey === "custom" ? {name: "Custom", alphabet: customAlphabet} : languages[key];
    });
</script>

<Select bind:value={rawKey} items={values}/>

{#if rawKey === "custom"}
    <input type="text" bind:value={customAlphabet}>
{/if}
