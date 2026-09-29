import { CommonKeys, getKeySymbol } from "../keystrokes";
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
                <span
                    class="secondary"
                    subscribe:innerText={chatMessageViewModel.contact.name}
                ></span>
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
                ctkeystroke={getKeySymbol(CommonKeys.CloseOrCancel)}
            >
                <span class="icon">close</span>
            </button>
        </div>
    );
}
