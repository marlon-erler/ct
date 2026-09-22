import * as React from "../../react";

export function RibbonButton(
    label: string,
    icon: string,
    isSelected: React.State<boolean>,
    select: () => void,
    isHighlighted: React.State<boolean> = new React.State(false),
) {
    return (
        <button
            class="ribbon-button animate-highlight"
            aria-label={label}
            toggle:selected={isSelected}
            toggle:highlight={isHighlighted}
            on:click={select}
        >
            <span class="icon">{icon}</span>
        </button>
    );
}
