import { MessageReactionButton } from "./messageReactionButton";
import * as React from "../../react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { ReactionSymbols } from "../../Model/Chat/chatModel";

export function MessageReactionButtonRow(
    coreViewModel: CoreViewModel,
    chatMessageViewModel: ChatMessageViewModel,
) {
    return (
        <div class="grid gap width-100 message-reaction-row">
            {MessageReactionButton(
                coreViewModel,
                chatMessageViewModel,
                ReactionSymbols.ThumbsUp,
            )}
            {MessageReactionButton(
                coreViewModel,
                chatMessageViewModel,
                ReactionSymbols.Check,
            )}
            {MessageReactionButton(
                coreViewModel,
                chatMessageViewModel,
                ReactionSymbols.Stop,
            )}
            {MessageReactionButton(
                coreViewModel,
                chatMessageViewModel,
                ReactionSymbols.Attention,
            )}
            {MessageReactionButton(
                coreViewModel,
                chatMessageViewModel,
                ReactionSymbols.DoubleAttention,
            )}
            {MessageReactionButton(
                coreViewModel,
                chatMessageViewModel,
                ReactionSymbols.Question,
            )}
        </div>
    );
}
