<script lang="ts">
    let {
        content,
        hasAuto = true,
        auto = $bindable(hasAuto),
        selected = $bindable(0),
    }: {
        content: { name: string, func: () => void }[],
        hasAuto?: boolean,
        auto?: boolean,
        selected?: number,
    } = $props();

    function stateChange(index: number) {
        if (auto) {
            selected = index;
            return;
        }
        content[index].func();
    }

    $effect(() => {
        if (!auto) return;

        content[selected].func();
    });
</script>

<div>
    {#each content as {name}, i}
        <button
            disabled={auto && selected === i}
            onclick={() => stateChange(i)}
        >{name}</button>
    {/each}

    {#if hasAuto}
        <input type="checkbox" bind:checked={auto} name="auto">
        <label for="auto">Auto encrypt/decrypt</label>
    {/if}
</div>

<style>
    div {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }
</style>
