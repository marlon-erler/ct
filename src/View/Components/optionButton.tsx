import * as React from "../../react";

export function OptionButton<T>(
    text: string,
    value: T,
    selection: React.State<T>,
) {
    function select() {
        selection.value = value;
    }
    const isSelected = React.createProxyState(
        [selection],
        () => selection.value == value,
    );

    return (
        <button class="standard" toggle:selected={isSelected} on:click={select}>
            {text}
        </button>
    );
}
