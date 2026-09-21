import { v4 } from "uuid";
import * as React from "bloatless-react";
import { ViewController } from "../viewController";
import { StringToOption } from "../Components/option";
import SearchViewModel from "../../ViewModel/Utility/searchViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function SearchModal<T>(
    coreViewModel: CoreViewModel,
    searchViewModel: SearchViewModel<T>,
    headline: string,
    converter: React.StateItemConverter<T>,
    isOpen: React.State<boolean>,
) {
    function close() {
        isOpen.value = false;
    }

    const suggestionId = v4();

    isOpen.subscribe((isOpen) => {
        if (!isOpen) return;
        ViewController.setFocusWithDelay();
    });

    return (
        <div class="modal" toggle:open={isOpen} extended>
            <div>
                <main>
                    <h2>{headline}</h2>
                    <div class="flex-row">
                        <input
			    id="focused"
                            placeholder={
                                coreViewModel.translations.general.searchLabel
                            }
                            bind:value={searchViewModel.searchInput}
                            on:enter={searchViewModel.applySearch}
                            list={suggestionId}
                        ></input>
                        <datalist
                            hidden
                            id={suggestionId}
                            children:append={[
                                searchViewModel.suggestions,
                                StringToOption,
                            ]}
                        ></datalist>
                        <button
                            class="standard"
                            aria-label={
                                coreViewModel.translations.general
                                    .searchButtonClearAudioLabel
                            }
                            on:click={searchViewModel.clear}
                            toggle:disabled={searchViewModel.cannotClear}
                        >
                            <span class="icon">close</span>
                        </button>
                        <button
                            class="primary"
                            aria-label={
                                coreViewModel.translations.general
                                    .searchButtonAudioLabel
                            }
                            on:click={searchViewModel.applySearch}
                            toggle:disabled={searchViewModel.cannotApplySearch}
                        >
                            <span class="icon">search</span>
                        </button>
                    </div>

                    <hr></hr>

                    <div
                        class="grid gap"
                        style="grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr))"
                        children:append={[
                            searchViewModel.matchingObjects,
                            converter,
                        ]}
                    ></div>
                </main>
                <button on:click={close}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
