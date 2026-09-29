import * as React from "../../react";

export function HomePageButton(
    action: () => void,
    label: string,
    icon: string,
    key: string,
) {
    return (
        <button class="tile flex-no" on:click={action} ctkeystroke={key}>
            <span class="icon">{icon}</span>
            <div>
                <span>{label}</span>
            </div>
        </button>
    );
}
