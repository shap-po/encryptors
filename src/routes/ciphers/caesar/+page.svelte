<script lang="ts">
    import * as caesar from "$lib/ciphers/caesar";
    import LanguageSelect from "$lib/components/languageSelect.svelte";
    import {languages} from "$lib/util/lang";
    import TabMenu from "$lib/components/tabMenu.svelte";

    import {Input, Textarea} from 'flowbite-svelte';

    let text = $state("");
    let shift = $state(1);
    let lang = $state(languages.en);
    let output = $state("");
</script>

<TabMenu
    content={[
        {name: "Encrypt", func: () => output = caesar.encrypt(text, shift, lang.alphabet)},
        {name: "Decrypt", func: () => output = caesar.decrypt(text, shift, lang.alphabet)},
    ]}
/>

<Textarea bind:value={text}></Textarea>
<Input type="number" min="1" step="1" bind:value={shift}/>
<LanguageSelect bind:value={lang} text={text}/>
<Textarea readonly bind:value={output}></Textarea>
