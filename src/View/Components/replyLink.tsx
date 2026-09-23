import * as React from "../../react";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function ReplyLink(coreViewModel: CoreViewModel, chatMessageViewModel: ChatMessageViewModel) {
    const isHidden = React.createProxyState([chatMessageViewModel.replyCount], ()=>chatMessageViewModel.replyCount.value == 0);

    function select() {
	chatMessageViewModel.messagePageViewModel.setReplyView(chatMessageViewModel);
    }

    return (
	<div 
	    class="reply-link"
	    toggle:hidden={isHidden}
	    on:click={select}
	>
            <span>{coreViewModel.translations.chatPage.message.replyPrefixLabel}</span>
            <b class="ellipsis" subscribe:innerText={chatMessageViewModel.replyCount}></b>
        </div>
    );
}
