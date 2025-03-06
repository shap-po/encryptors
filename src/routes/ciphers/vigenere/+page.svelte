<script lang="ts">
    import * as vigenere from "$lib/ciphers/vigenere";
    import LanguageSelect from "$lib/components/languageSelect.svelte";
    import {languages} from "$lib/util/lang";
    import EncryptMenu from "$lib/components/encryptMenu.svelte";

    let text = $state("");
    let key = $state("");
    let lang = $state(languages.en);
    let output = $state("");
</script>

<EncryptMenu
    encryptFunc={() => output = vigenere.encrypt(text, key, lang.alphabet)}
    decryptFunc={() => output = vigenere.decrypt(text, key, lang.alphabet)}
/>

<div>
    <textarea bind:value={text}></textarea>
    <input bind:value={key}>
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
