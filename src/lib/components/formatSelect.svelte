<script lang="ts">
    import {Select} from "flowbite-svelte";
    import {type Format, formats} from "$lib/components/formatSelect.js";
    import {type SelectProps} from "flowbite-svelte/Select.svelte";

    let {
        value = $bindable(formats[0].value),
        ...rest
    }: {
        value: Format,
    } & Omit<SelectProps, "items" | "value"> = $props();
</script>

<Select bind:value items={formats} {...rest}/>
