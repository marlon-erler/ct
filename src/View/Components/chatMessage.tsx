import { ReplyLink } from "./replyLink";
import { MessageReactionButtonRow } from "./messageReactionButtonRow";
import { InlineReply } from "./inlineReply";
import { ChatMessageInfoModal } from "../Modals/chatMessageInfoModal";
import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { ChatMessageStatuses } from "../../Model/Chat/chatModel";

export function ChatMessage(
    coreViewModel: CoreViewModel,
    chatMessageViewModel: ChatMessageViewModel,
) {
    const statusIcon = React.createProxyState(
        [chatMessageViewModel.status],
        () => {
            switch (chatMessageViewModel.status.value) {
                case ChatMessageStatuses.Outbox:
                    return "hourglass_top";
                case ChatMessageStatuses.Sent:
                    return "check";
                case ChatMessageStatuses.Received:
                    return "done_all";
                default:
                    return "warning";
            }
        },
    );

    return (
        <div
            class="message-bubble"
            id={chatMessageViewModel.chatMessage.id}
            toggle:sentbyuser={chatMessageViewModel.sentByUser}
            toggle:hidden={chatMessageViewModel.isHidden}
        >
            {InlineReply(chatMessageViewModel)}
            <div class="main tile">
                <div class="text-container">
                    <span class="sender-name ellipsis">
                        {chatMessageViewModel.senderName}
                    </span>
                    <span
                        class="body"
                        subscribe:innerText={chatMessageViewModel.body}
                    ></span>
                    <span class="timestamp ellipsis">
                        <span
                            class="icon"
                            subscribe:innerText={statusIcon}
                        ></span>
                        {chatMessageViewModel.dateSent}
                    </span>
                </div>

                <div class="button-container">
                    <button
                        on:click={chatMessageViewModel.showInfoModal}
                        aria-label={
                            coreViewModel.translations.chatPage.message
                                .showMessageInfoButtonAudioLabel
                        }
                    >
                        <span class="icon">info</span>
                    </button>
                    <button
                        class="reply-button"
                        on:click={chatMessageViewModel.reply}
                        aria-label={
                            coreViewModel.translations.chatPage.message
                                .replyToMessageButton
                        }
                        toggle:hidden={
                            chatMessageViewModel.messagePageViewModel
                                .isReplyViewActive
                        }
                    >
                        <span class="icon">reply</span>
                    </button>
                </div>
            </div>
            {MessageReactionButtonRow(coreViewModel, chatMessageViewModel)}
            {ReplyLink(coreViewModel, chatMessageViewModel)}
            {ChatMessageInfoModal(coreViewModel, chatMessageViewModel)}
        </div>
    );
}
