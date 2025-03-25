<script lang="ts">
    import * as vigenere from "$lib/ciphers/vigenere";
    import LanguageSelect from "$lib/components/languageSelect.svelte";
    import {languages} from "$lib/util/lang";
    import TabMenu from "$lib/components/tabMenu.svelte";
    import {Input, Textarea} from 'flowbite-svelte';

    let text = $state("");
    let key = $state("");
    let lang = $state(languages.en);
    let output = $state("");
</script>

<svelte:head>
    <title>Vigenère cipher</title>
</svelte:head>

<TabMenu
    content={[
        {name: "Encrypt", func: () => output = vigenere.encrypt(text, key, lang.alphabet)},
        {name: "Decrypt", func: () => output = vigenere.decrypt(text, key, lang.alphabet)},
    ]}
/>

<Textarea bind:value={text}></Textarea>
<Input bind:value={key}/>
<LanguageSelect bind:value={lang} text={text}/>
<Textarea readonly bind:value={output}></Textarea>
