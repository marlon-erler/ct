import * as React from "../../react";
import { ViewController } from "../viewController";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";

export function InlineReply(chatMessageViewModel: ChatMessageViewModel) {
    const reply = chatMessageViewModel.inlineReply;
    if (reply == undefined) return <div></div>;

    const scroll = () => {
        ViewController.scrollToView(reply.chatMessage.id);
    };

    return (
        <div class="inline-reply" on:click={scroll}>
            <span>{reply.sender}</span>
            <b class="ellipsis" subscribe:innerText={reply.body}></b>
        </div>
    );
}
