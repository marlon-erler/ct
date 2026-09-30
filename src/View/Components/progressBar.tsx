import * as React from "../../react";

export function ProgressBar(
    valueLabel: React.State<string>,
    value: React.State<number>,
    maximum: React.State<number>,
) {
    const style = React.createProxyState(
        [value, maximum],
        () => `width: ${100 * (value.value / maximum.value)}%`,
    );

    return (
        <div>
            <div class="width-100 surface-alt" style="height: 18px">
                <div
                    class="height-100 background-primary"
                    set:style={style}
                ></div>
            </div>
            <span class="secondary" subscribe:innerText={valueLabel}></span>
        </div>
    );
}
