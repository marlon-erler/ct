import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";

export function ReplyPreview(
    coreViewModel: CoreViewModel,
    chatMessageViewModel: ChatMessageViewModel,
) {
    return (
        <div class="reply-preview">
            <div class="surface blur">
                <span class="secondary">{chatMessageViewModel.senderId}</span>
                <b
                    class="ellipsis"
                    subscribe:innerText={chatMessageViewModel.body}
                ></b>
            </div>
            <button
                class="standard square blur"
                on:click={chatMessageViewModel.cancelReply}
                aria-label={
                    coreViewModel.translations.chatPage.message
                        .cancelReplyAudioLabel
                }
            >
                <span class="icon">close</span>
            </button>
        </div>
    );
}
