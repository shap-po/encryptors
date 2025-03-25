<script lang="ts">
    import {Button, ButtonGroup, Toggle} from "flowbite-svelte";

    let {
        content,
        hasAuto = true,
        autoLabel = $bindable("Auto"),
        auto = $bindable(hasAuto),
        selected = $bindable(0),
    }: {
        content: { name: string, func: () => void }[],
        hasAuto?: boolean,
        autoLabel?: string,
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

<ButtonGroup>
    {#each content as {name}, i}
        <Button
            disabled={auto && selected === i}
            onclick={() => stateChange(i)}
        >{name}</Button>
    {/each}

    {#if hasAuto}
        <Toggle bind:checked={auto} class="pl-1">Auto</Toggle>
    {/if}
</ButtonGroup>
