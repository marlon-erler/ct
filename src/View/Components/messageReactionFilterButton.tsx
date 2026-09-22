import * as React from "../../react";
import MessagePageViewModel from "../../ViewModel/Pages/messagePageViewModel";
import { ReactionSymbols } from "../../Model/Chat/chatModel";

export function MessageReactionFilterButton(
    messagePageViewModel: MessagePageViewModel,
    content: ReactionSymbols,
) {
    const select = () => {
        messagePageViewModel.setReactionFilter(content);
    };

    const isSelected = React.createProxyState(
        [messagePageViewModel.reactionFilter],
        () => messagePageViewModel.reactionFilter.value == content,
    );

    return (
        <button
            class="flex justify-center"
            on:click={select}
            toggle:selected={isSelected}
        >
            {content}
        </button>
    );
}
