<script lang="ts">
    import {Fileupload, Textarea} from "flowbite-svelte";

    let {
        value = $bindable(""),
    }: {
        value: string,
    } = $props();

    // allow user to upload a file instead of typing
    let files = $state<FileList>();
    $effect(() => {
        const file = files?.[0];

        if (file === undefined) return;
        if (file.type !== "text/plain") {
            files = undefined;
            alert("Invalid file type");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text !== "string") {
                alert("Failed to read file");
                return;
            }
            value = text;
            files = undefined;
        };

        reader.readAsText(file);
    })
</script>

<Textarea bind:value={value} placeholder="Put plaintext here or upload a file instead"/>
<Fileupload bind:files/>
