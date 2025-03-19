<script lang="ts">
    import "../app.css";
    import Navbar from "$lib/components/navbar.svelte";

    let {children} = $props();
</script>

<Navbar/>
<div>
    {@render children()}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style>
