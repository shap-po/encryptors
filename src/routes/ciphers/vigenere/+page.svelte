<script lang="ts">
    import * as vigenere from "$lib/ciphers/vigenere";
    import LanguageSelect from "$lib/components/languageSelect.svelte";
    import {languages} from "$lib/util/lang";
    import TabMenu from "$lib/components/tabMenu.svelte";
    import PlaintextInput from "$lib/components/plaintextInput.svelte";
    import {Input, Textarea} from 'flowbite-svelte';

    let text = $state("");
    let key = $state("");
    let lang = $state(languages.en);
    let langKey = $state("en");
    let output = $state("");
</script>

<svelte:head>
    <title>Vigenère cipher</title>
</svelte:head>

<TabMenu
    content={[
        {name: "Encrypt", func: () => output = vigenere.encrypt(text, key, lang.alphabet)},
        {name: "Decrypt", func: () => output = vigenere.decrypt(text, key, lang.alphabet)},
        {name: "Analyze", func: async () => output = await vigenere.analyze(text, langKey, lang.alphabet)},
    ]}
/>

<PlaintextInput bind:value={text}/>
<Input bind:value={key}/>
<LanguageSelect bind:value={lang} bind:key={langKey} text={text}/>
<Textarea readonly bind:value={output}></Textarea>
