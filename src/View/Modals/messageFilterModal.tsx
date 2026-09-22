import * as React from "../../react";
import { ViewController } from "../viewController";
import { MessageReactionFilterButton } from "../Components/messageReactionFilterButton";
import MessagePageViewModel from "../../ViewModel/Pages/messagePageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import { ReactionSymbols } from "../../Model/Chat/chatModel";

export function MessageFilterModal<T>(
    coreViewModel: CoreViewModel,
    messagePageViewModel: MessagePageViewModel,
    converter: React.StateItemConverter<T>,
) {
    const noFilter = React.createProxyState(
        [messagePageViewModel.reactionFilter],
        () => messagePageViewModel.reactionFilter.value == undefined,
    );

    messagePageViewModel.isFilterModalOpen.subscribe((isOpen) => {
        if (isOpen == false) return;
        ViewController.setFocusWithDelay();
    });
    React.createProxyState([messagePageViewModel.isFilterModalOpen], () => {
        if (messagePageViewModel.isFilterModalOpen.value == false) return;
        ViewController.setFocusWithDelay();
    });

    return (
        <div class="modal" toggle:open={messagePageViewModel.isFilterModalOpen}>
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.chatPage.message
                                .messageFilterHeadline
                        }
                    </h2>
                    <div class="flex-row width-input">
                        <input
                            id="focused"
                            placeholder={
                                coreViewModel.translations.general.searchLabel
                            }
                            bind:value={
                                messagePageViewModel.searchViewModel.searchInput
                            }
                            on:enter={
                                messagePageViewModel.searchViewModel.applySearch
                            }
                        ></input>
                        <button
                            class="primary"
                            aria-label={
                                coreViewModel.translations.general
                                    .searchButtonAudioLabel
                            }
                            on:click={
                                messagePageViewModel.searchViewModel.applySearch
                            }
                            toggle:disabled={
                                messagePageViewModel.searchViewModel
                                    .cannotApplySearch
                            }
                        >
                            <span class="icon">search</span>
                        </button>
                    </div>

                    <hr></hr>

                    <h3>
                        {
                            coreViewModel.translations.chatPage.message
                                .messageFilterReactionsHadline
                        }
                    </h3>

                    <div class="flex-column gap">
                        <button
                            toggle:selected={noFilter}
                            on:click={messagePageViewModel.revokeReactionFilter}
                        >
                            {
                                coreViewModel.translations.chatPage.message
                                    .messageFilterAllReactionsButton
                            }
                        </button>
                        <div class="grid gap message-reaction-filter">
                            {MessageReactionFilterButton(
                                messagePageViewModel,
                                ReactionSymbols.ThumbsUp,
                            )}
                            {MessageReactionFilterButton(
                                messagePageViewModel,
                                ReactionSymbols.Check,
                            )}
                            {MessageReactionFilterButton(
                                messagePageViewModel,
                                ReactionSymbols.Stop,
                            )}
                            {MessageReactionFilterButton(
                                messagePageViewModel,
                                ReactionSymbols.Attention,
                            )}
                            {MessageReactionFilterButton(
                                messagePageViewModel,
                                ReactionSymbols.DoubleAttention,
                            )}
                            {MessageReactionFilterButton(
                                messagePageViewModel,
                                ReactionSymbols.Question,
                            )}
                        </div>
                    </div>
                </main>
                <button on:click={messagePageViewModel.hideFilterModal}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
