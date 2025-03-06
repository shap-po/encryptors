<script lang="ts">
    let {encryptFunc, decryptFunc} = $props();

    let isEncryptMode = $state(true);
    let autoEncrypt = $state(true);

    function encryptClick() {
        if (autoEncrypt) {
            isEncryptMode = true;
            return;
        }
        encryptFunc();
    }

    function decryptClick() {
        if (autoEncrypt) {
            isEncryptMode = false;
            return;
        }
        decryptFunc();
    }

    $effect(() => {
        if (!autoEncrypt) {
            return;
        }

        if (isEncryptMode) {
            encryptFunc();
        } else {
            decryptFunc();
        }
    });
</script>

<div>
    <button onclick={encryptClick} disabled={autoEncrypt && isEncryptMode}>Encrypt</button>
    <button onclick={decryptClick} disabled={autoEncrypt && !isEncryptMode}>Decrypt</button>

    <input type="checkbox" bind:checked={autoEncrypt} name="autoEncrypt">
    <label for="autoEncrypt">Auto encrypt/decrypt</label>
</div>

<style>
    div {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }
</style>
