import "./chatPage.css";
import { ChatPage } from "./chatPage";
import * as React from "../react";
import CoreViewModel from "../ViewModel/Global/coreViewModel";
import ChatListViewModel from "../ViewModel/Chat/chatListViewModel";

export function ChatPageWrapper(
    coreViewModel: CoreViewModel,
    chatListViewModel: ChatListViewModel,
) {
    const chatPageContent = React.createProxyState(
        [chatListViewModel.selectedChat],
        () => {
            if (chatListViewModel.selectedChat.value == undefined) {
                return <div></div>;
            } else {
                return ChatPage(
                    coreViewModel,
                    chatListViewModel.selectedChat.value,
                );
            }
        },
    );

    return <div id="chat-page-wrapper" children:set={chatPageContent}></div>;
}
