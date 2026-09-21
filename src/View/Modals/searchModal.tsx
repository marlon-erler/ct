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
			    style="max-width: unset"
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

		    <div 
			toggle:hidden={searchViewModel.hasNoSuggestions}>
			<hr></hr>
			<h3>{coreViewModel.translations.general.searchSuggestionsLabel}</h3>
			<div
			    class="flex-column gap"
			    children:append={[
				searchViewModel.suggestions,
				(suggestion: string) => SuggestionView(suggestion, searchViewModel, coreViewModel),
			    ]}
			></div>
		    </div>
		</main>
		<button on:click={close}>
		    {coreViewModel.translations.general.closeButton}
		    <span class="icon">close</span>
		</button>
	    </div>
	</div>
    );
}

function SuggestionView<T>(suggestion: string, searchViewModel: SearchViewModel<T>, coreViewModel: CoreViewModel) {
    const isApplied = React.createProxyState([searchViewModel.appliedQuery], ()=>searchViewModel.appliedQuery.value == suggestion);

    function deleteSuggestion() {
	searchViewModel.deleteSuggestion(suggestion);
    }

    function applySuggestion() {
	searchViewModel.search(suggestion);
    }

    return <div class="flex-row surface align-center">
	<span class="width-100 flex-1 padding-h">{suggestion}</span>
	<button 
	    class="danger"
	    aria-label={coreViewModel.translations.general.deleteButton}
	    on:click={deleteSuggestion}
	>
	    <span class="icon">delete</span>
	</button>
	<button 
	    class="primary"
	    aria-label={coreViewModel.translations.general.applyButton}
	    on:click={applySuggestion}
	    toggle:disabled={isApplied}
	>
	    <span class="icon">check</span>
	</button>
    </div>
}
