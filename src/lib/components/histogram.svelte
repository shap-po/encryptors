<script lang="ts">
    const {
        width,
        height,
        margin = 20,
        padding = 2,
        points,
        labels,
        barLabels,
    }: {
        width?: number;
        height: number;
        margin?: number;
        padding?: number;
        points: number[];
        labels?: string[];
        barLabels?: string[];
    } = $props();
    let containerWidth = $state(0);

    const svgWidth = $derived(width || containerWidth);
    const svgHeight = $derived(height + margin * 2);

    const barWidth = $derived((svgWidth - padding * (points.length - 1)) / points.length);
    const scale = $derived(height / (Math.max(...points) || 1));
</script>


<div bind:clientWidth={containerWidth} class="w-full">
    <svg width={svgWidth} height={svgHeight} fill="currentColor" class="overflow-visible dark:text-white">
        <g class="text-primary-600">
            {#each points as point, i}
                <rect
                    x={i * (barWidth + padding)}
                    y={height + margin - point * scale}
                    width={barWidth}
                    height={point * scale || 1}
                />
            {/each}
        </g>

        {#if labels}
            <g>
                {#each labels as label, i}
                    <text
                        x={i * (barWidth + padding) + barWidth / 2}
                        y={height + margin * 2}
                        text-anchor="middle"
                    >
                        {label}
                    </text>
                {/each}
            </g>
        {/if}

        {#if barLabels}
            <g>
                {#each barLabels as label, i}
                    <text
                        x={i * (barWidth + padding) + barWidth / 2}
                        y={height + margin - points[i] * scale - 2}
                        text-anchor="middle"
                    >
                        {label}
                    </text>
                {/each}
            </g>
        {/if}
    </svg>
</div>
