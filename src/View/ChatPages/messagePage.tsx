import "./messagePage.css";
import { ViewController } from "../viewController";
import { MessageFilterModal } from "../Modals/messageFilterModal";
import { ReplyPreview } from "../Components/replyPreview";
import { ChatMessage } from "../Components/chatMessage";
import * as React from "../../react";
import MessagePageViewModel from "../../ViewModel/Pages/messagePageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import {ReplyViewHeader} from "../Components/replyViewHeader";

export function MessagePage(
    coreViewModel: CoreViewModel,
    messagePageViewModel: MessagePageViewModel,
) {
    messagePageViewModel.loadData();

    const ChatMessageViewModelToView: React.StateItemConverter<
        ChatMessageViewModel
    > = (chatMessageViewModel: ChatMessageViewModel) => {
        return ChatMessage(coreViewModel, chatMessageViewModel);
    };

    const messageContainer = (
        <div
            id="message-container"
            children:append={[
                messagePageViewModel.filteredMessageViewModels,
                ChatMessageViewModelToView,
            ]}
        ></div>
    );

    const persistenceId = messagePageViewModel.chatViewModel.chatModel.id;
    const replyPreview = ViewController.inlineReplies.setState(
        persistenceId,
        () =>
            React.createProxyState(
                [messagePageViewModel.replyingMessage],
                () => {
                    if (messagePageViewModel.replyingMessage.value == undefined)
                        return <div></div>;
                    return ReplyPreview(
                        coreViewModel,
                        messagePageViewModel.replyingMessage.value,
                    );
                },
            ),
    );

    function scrollDown(hard: boolean = false) {
        if (hard) {
            messageContainer.setAttribute("scroll-hard", "");
        }
        messageContainer.scrollTop = messageContainer.scrollHeight;
        messageContainer.removeAttribute("scroll-hard");
    }
    function scrollDownIfApplicable() {
        const scrollFromBottom =
            messageContainer.scrollHeight -
            (messageContainer.scrollTop + messageContainer.offsetHeight);
        if (scrollFromBottom > 400) return;

        scrollDown();
    }
    messagePageViewModel.filteredMessageViewModels.subscribeSilent(
        scrollDownIfApplicable,
    );
    messagePageViewModel.replyViewSelectedMessage.subscribeSilent(selectedMessage => {
	if (selectedMessage != undefined) return;
	setTimeout(scrollDown, 100);
    })
    setTimeout(() => scrollDown(true), 100);

    messagePageViewModel.focusSetter.subscribeSilent(() => {
        ViewController.setFocusWithDelay();
    });

    const isInReplyView = React.createProxyState([messagePageViewModel.replyViewSelectedMessage], ()=>messagePageViewModel.replyViewSelectedMessage.value != undefined);

    return (
        <div id="message-page" toggle:reply-view={isInReplyView}>
            <div class="pane-wrapper">
                <div class="pane">
                    <div class="toolbar">
                        <span class="title">
                            {
                                coreViewModel.translations.chatPage.message
                                    .messagesHeadline
                            }
                        </span>
                        <span>
                            <button
                                class="ghost inset-outline"
                                on:click={messagePageViewModel.showFilterModal}
                                aria-label={
                                    coreViewModel.translations.chatPage.message
                                        .filterMessagesButtonAudioLabel
                                }
                                toggle:selected={
                                    messagePageViewModel.isFilterActive
                                }
                            >
                                <span class="icon">filter_alt</span>
                            </button>
                        </span>
                    </div>
		    <div class="content">
			{ReplyViewHeader(coreViewModel, messagePageViewModel)}
                        {messageContainer}
                        <div id="composer">
                            <div class="content-width-constraint">
                                <div
                                    class="reply-preview-wrapper"
                                    children:set={replyPreview}
                                ></div>
                                <div class="input-width-constraint">
                                    <input
                                        id="focused"
                                        class="blur"
                                        bind:value={
                                            messagePageViewModel.composingMessage
                                        }
                                        on:enter={
                                            messagePageViewModel.sendMessage
                                        }
                                        placeholder={
                                            coreViewModel.translations.chatPage
                                                .message
                                                .composerInputPlaceholder
                                        }
                                    ></input>
                                    <button
                                        class="primary blur"
                                        aria-label={
                                            coreViewModel.translations.chatPage
                                                .message
                                                .sendMessageButtonAudioLabel
                                        }
                                        on:click={
                                            messagePageViewModel.sendMessage
                                        }
                                        toggle:disabled={
                                            messagePageViewModel.cannotSendMessage
                                        }
                                    >
                                        <span class="icon">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {MessageFilterModal(
                coreViewModel,
                messagePageViewModel,
                ChatMessageViewModelToView,
            )}
        </div>
    );
}
