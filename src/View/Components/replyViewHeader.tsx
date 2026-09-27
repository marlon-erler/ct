import * as React from "../../react";
import MessagePageViewModel from "../../ViewModel/Pages/messagePageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function ReplyViewHeader(
    coreViewModel: CoreViewModel,
    messagePageViewModel: MessagePageViewModel,
) {
    const isHidden = React.createProxyState(
        [messagePageViewModel.isReplyViewActive],
        () => !messagePageViewModel.isReplyViewActive.value,
    );

    const label = React.createProxyState(
        [messagePageViewModel.replyViewSelectedMessage],
        () =>
            messagePageViewModel.replyViewSelectedMessage.value == undefined
                ? ""
                : coreViewModel.translations.chatPage.message.replyHeaderLabel(
                      messagePageViewModel.replyViewSelectedMessage.value
                          .senderId,
                  ),
    );
    const message = React.createProxyState(
        [messagePageViewModel.replyViewSelectedMessage],
        () =>
            messagePageViewModel.replyViewSelectedMessage.value == undefined
                ? ""
                : messagePageViewModel.replyViewSelectedMessage.value.body
                      .value,
    );

    return (
        <div class="reply-header" toggle:hidden={isHidden}>
            <b class="ellipsis" subscribe:innerText={label}></b>
            <span
                class="secondary ellipsis"
                subscribe:innerText={message}
            ></span>
            <button
                class="standard square"
                on:click={messagePageViewModel.resetReplyView}
            >
                <span class="icon">close</span>
            </button>
        </div>
    );
}
