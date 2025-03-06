<script lang="ts">
    import * as caesar from "$lib/ciphers/caesar";
    import LanguageSelect from "$lib/components/languageSelect.svelte";
    import {languages} from "$lib/util/lang";
    import EncryptMenu from "$lib/components/encryptMenu.svelte";

    let text = $state("");
    let shift = $state(1);
    let lang = $state(languages.en);
    let output = $state("");
</script>

<EncryptMenu
    encryptFunc={() => output = caesar.encrypt(text, shift, lang.alphabet)}
    decryptFunc={() => output = caesar.decrypt(text, shift, lang.alphabet)}
/>

<div>
    <textarea bind:value={text}></textarea>
    <input type="number" min="1" step="1" bind:value={shift}>
    <LanguageSelect bind:value={lang} text={text}/>
    <textarea readonly bind:value={output}></textarea>
</div>

<style>
    div {
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
