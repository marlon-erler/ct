import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { ReactionSymbols } from "../../Model/Chat/chatModel";

export function MessageReactionButton(
    coreViewModel: CoreViewModel,
    chatMessageViewModel: ChatMessageViewModel,
    content: ReactionSymbols,
) {
    let audioLabel: string;
    let count: React.State<number>;
    let isActive = React.createProxyState(
        [chatMessageViewModel.userReaction],
        () => chatMessageViewModel.userReaction.value == content,
    );

    function sendReaction() {
        chatMessageViewModel.sendReaction(content, isActive.value);
    }

    switch (content) {
        case ReactionSymbols.ThumbsUp: {
            audioLabel =
                coreViewModel.translations.chatPage.message.thumbsUpReaction;
            count = chatMessageViewModel.reactionsThumbsUpCount;
            break;
        }
        case ReactionSymbols.Check: {
            audioLabel =
                coreViewModel.translations.chatPage.message.checkReaction;
            count = chatMessageViewModel.reactionsCheckCount;
            break;
        }
        case ReactionSymbols.Stop: {
            audioLabel =
                coreViewModel.translations.chatPage.message.stopReaction;
            count = chatMessageViewModel.reactionsStopCount;
            break;
        }
        case ReactionSymbols.Attention: {
            audioLabel =
                coreViewModel.translations.chatPage.message.attentionReaction;
            count = chatMessageViewModel.reactionsAttentionCount;
            break;
        }
        case ReactionSymbols.DoubleAttention: {
            audioLabel =
                coreViewModel.translations.chatPage.message
                    .doubleAttentionReaction;
            count = chatMessageViewModel.reactionsDoubleAttentionCount;
            break;
        }
        case ReactionSymbols.Question: {
            audioLabel =
                coreViewModel.translations.chatPage.message.questionReaction;
            count = chatMessageViewModel.reactionsQuestionCount;
            break;
        }
    }

    return (
        <button
            class="flex"
            on:click={sendReaction}
            aria-label={audioLabel}
            toggle:selected={isActive}
            set:count={count}
        >
            {content}
            <span subscribe:innerText={count}></span>
        </button>
    );
}
