import * as React from "../../react";
import { ChatMessageReaction } from "../../Model/Chat/chatModel";

export function MessageReactionEntry(reaction: ChatMessageReaction) {
    return (
        <div class="tile flex-row">
            <span class="flex width-100">{reaction.senderName}</span>
            <span>{reaction.content}</span>
        </div>
    );
}
