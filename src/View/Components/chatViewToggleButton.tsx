import { RibbonButton } from "./ribbonButton";
import * as React from "../../react";
import ChatViewModel, {
    ChatPageTypes,
} from "../../ViewModel/Chat/chatViewModel";

export function ChatViewToggleButton(
    label: string,
    icon: string,
    page: ChatPageTypes,
    chatViewModel: ChatViewModel,
    key: string,
) {
    function select() {
        chatViewModel.openPage(page);
    }

    const isSelected = React.createProxyState(
        [chatViewModel.selectedPage],
        () => chatViewModel.selectedPage.value == page,
    );

    const isHighlighted = new React.State(false);
    if (page == ChatPageTypes.Messages) {
        chatViewModel.hasUnreadMessages.subscribe(
            (hasUnreadMessages) => (isHighlighted.value = hasUnreadMessages),
        );
    }

    return RibbonButton(label, icon, isSelected, select, isHighlighted, key);
}
