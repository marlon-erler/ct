import { ViewController } from "../viewController";
import * as React from "../../react";
import { ContactViewModel } from "../../ViewModel/Global/contactViewModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";

export function InlineReply(chatMessageViewModel: ChatMessageViewModel) {
    const reply = chatMessageViewModel.inlineReply;
    if (reply == undefined) return <div></div>;

    const scroll = () => {
        ViewController.scrollToView(reply.chatMessage.fileId);
    };

    return (
        <div class="inline-reply" on:click={scroll}>
            <span subscribe:innerText={reply.contact.name}></span>
            <b class="ellipsis" subscribe:innerText={reply.body}></b>
        </div>
    );
}
