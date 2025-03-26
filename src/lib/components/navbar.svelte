<script lang="ts">
    import {page} from '$app/state';
    import {Dropdown, DropdownItem, Navbar, NavBrand, NavLi, NavUl} from "flowbite-svelte";
    import {ChevronDownOutline} from 'flowbite-svelte-icons';
    import {base} from "$app/paths";

    let activeUrl = $derived(page.url.pathname);
</script>

<Navbar navContainerClass="justify-normal">
    <NavBrand href={base}>
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Encryptors</span>
    </NavBrand>
    <NavUl {activeUrl}>
        <NavLi>
            Ciphers
            <ChevronDownOutline class="w-6 h-6 ms-2 text-primary-800 dark:text-white inline"/>
        </NavLi>
        <Dropdown {activeUrl}>
            <DropdownItem href="{base}/ciphers/caesar">Caesar</DropdownItem>
            <DropdownItem href="{base}/ciphers/vigenere">Vigenere</DropdownItem>
        </Dropdown>
        <NavLi>
            Tools
            <ChevronDownOutline class="w-6 h-6 ms-2 text-primary-800 dark:text-white inline"/>
        </NavLi>
        <Dropdown {activeUrl}>
            <DropdownItem href="{base}/tools/frequency-analysis">Frequency Analysis</DropdownItem>
        </Dropdown>
    </NavUl>
</Navbar>
