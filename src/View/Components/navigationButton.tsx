import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function NavigationButton<T>(
    coreViewModel: CoreViewModel,
    label: string,
    navigationState: React.State<T | undefined>,
    page: T,
    arrowMobileOnly?: boolean,
) {
    const isSelected = React.createProxyState(
        [navigationState],
        () => navigationState.value == page,
    );

    function open() {
        navigationState.value = page;
    }

    const iconClass = `icon ${arrowMobileOnly == true ? "mobile-only" : ""}`;

    return (
        <button toggle:selected={isSelected} on:click={open}>
            {label}

            <span class={iconClass}>arrow_forward</span>
        </button>
    );
}
