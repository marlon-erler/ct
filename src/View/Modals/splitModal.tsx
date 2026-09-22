import "./splitModal.css";
import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function SplitModal<T>(
    coreViewModel: CoreViewModel,
    leftView: React.State<Element>,
    rightView: React.State<Element>,
    extendedStyle: boolean = false,
    navigationState?: React.State<T | undefined>,
) {
    function closePage() {
        if (!navigationState) return;
        navigationState.value = undefined;
    }

    const hasPageOpen = new React.State<boolean>(false);
    navigationState?.subscribe(
        (newValue) => (hasPageOpen.value = newValue != undefined),
    );

    const view = (
        <div
            class="split-modal"
            toggle:extended={extendedStyle}
            toggle:navigation={navigationState != undefined}
            toggle:page-open={hasPageOpen}
        >
            <div>
                <div class="scroll-area" children:set={leftView}></div>
            </div>
            <div class="scroll-area slide-up">
                <div
                    class="flex-row width-100 mobile-only"
                    toggle:hidden={navigationState == undefined}
                >
                    <button
                        class="ghost square"
                        aria-label={
                            coreViewModel.translations.general.backButton
                        }
                        on:click={closePage}
                    >
                        <span class="icon">arrow_back</span>
                    </button>
                </div>
                <div children:set={rightView}></div>
            </div>
        </div>
    );

    return view;
}
