import * as React from "../../react";
import ChatViewModel from "../../ViewModel/Chat/chatViewModel";

export function ChatEntry(chatViewModel: ChatViewModel) {
    const view = (
        <button
            class="tile colored-tile chat-entry animate-highlight slide-up"
            set:color={chatViewModel.settingsPageViewModel.color}
            style="height: 8rem"
            on:click={chatViewModel.open}
            toggle:highlight={chatViewModel.hasUnreadMessages}
        >
            <span
                class="shadow"
                subscribe:innerText={chatViewModel.settingsPageViewModel.name}
            ></span>
            <h2
                subscribe:innerText={chatViewModel.settingsPageViewModel.name}
            ></h2>
        </button>
    );

    chatViewModel.index.subscribe((newIndex) => {
        view.style.order = newIndex;
    });

    return view;
}

export const ChatViewModelToChatEntry: React.StateItemConverter<
    ChatViewModel
> = (chatViewModel: ChatViewModel) => {
    return ChatEntry(chatViewModel);
};
