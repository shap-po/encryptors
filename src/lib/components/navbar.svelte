<script lang="ts">
    import {page} from '$app/state';
    import {Dropdown, DropdownItem, Navbar, NavLi, NavUl} from "flowbite-svelte";
    import {ChevronDownOutline} from 'flowbite-svelte-icons';
    import {base} from "$app/paths";

    let activeUrl = page.url.toString();
</script>

<Navbar>
    <NavUl {activeUrl}>
        <NavLi>
            Ciphers
            <ChevronDownOutline class="w-6 h-6 ms-2 text-primary-800 dark:text-white inline"/>
        </NavLi>
        <Dropdown>
            <DropdownItem href="{base}/ciphers/caesar">Caesar</DropdownItem>
            <DropdownItem href="{base}/ciphers/vigenere">Vigenere</DropdownItem>
        </Dropdown>
        <NavLi>
            Tools
            <ChevronDownOutline class="w-6 h-6 ms-2 text-primary-800 dark:text-white inline"/>
        </NavLi>
        <Dropdown>
            <DropdownItem href="{base}/tools/frequency-analysis">Frequency Analysis</DropdownItem>
        </Dropdown>
    </NavUl>
</Navbar>
