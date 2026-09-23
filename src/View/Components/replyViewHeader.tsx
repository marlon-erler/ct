import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import MessagePageViewModel from "../../ViewModel/Pages/messagePageViewModel";

export function ReplyViewHeader(coreViewModel: CoreViewModel, messagePageViewModel: MessagePageViewModel) {
    const isHidden = React.createProxyState([messagePageViewModel.replyViewSelectedMessage], ()=>messagePageViewModel.replyViewSelectedMessage.value == undefined);

    const label = React.createProxyState([messagePageViewModel.replyViewSelectedMessage], ()=>coreViewModel.translations.chatPage.message.replyHeaderLabel(messagePageViewModel.replyViewSelectedMessage.value.sender));

    return (
	<div 
	    class="reply-header"
	    toggle:hidden={isHidden}
	>
	    <b class="ellipsis" subscribe:innerText={label}></b>
	    <button 
		class="primary square"
		on:click={messagePageViewModel.resetReplyView}
	    >
		<span class="icon">close</span>
	    </button>
	</div>
    );
}
