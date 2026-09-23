import MessagePageViewModel from "../Pages/messagePageViewModel";
import CoreViewModel from "../Global/coreViewModel";
import * as React from "../../react";
import {
    ChatMessage,
    ChatMessageReaction,
    ChatMessageStatuses,
    ReactionSymbols,
} from "../../Model/Chat/chatModel";

export default class ChatMessageViewModel {
    // data
    chatMessage: ChatMessage;
    channel: string = "";
    sender: string = "";
    dateSent: string = "";
    body: React.State<string> = new React.State("");
    inlineReply: ChatMessageViewModel | undefined = undefined;
    replies: React.MapState<ChatMessageViewModel> = new React.MapState();
    replyCount: React.State<number> = React.createProxyState([this.replies], ()=>this.replies.value.size);
    status: React.State<ChatMessageStatuses | any> = new React.State<any>(
        undefined,
    );
    sentByUser: boolean;

    isHidden = new React.State<boolean>(false);

    allReactions = new React.MapState<ChatMessageReaction>();
    userReaction = new React.State<ReactionSymbols | string | undefined>(
        undefined,
    );
    reactionsThumbsUp = React.MapState<ChatMessageReaction>;
    reactionsCheck = React.MapState<ChatMessageReaction>;
    reactionsStop = React.MapState<ChatMessageReaction>;
    reactionsAttention = React.MapState<ChatMessageReaction>;
    reactionsDoubleAttention = React.MapState<ChatMessageReaction>;
    reactionsQuestion = React.MapState<ChatMessageReaction>;

    generateReactionCountProxyState = (
        content: ReactionSymbols,
    ): React.State<number> => {
        return React.createProxyState(
            [this.allReactions],
            () =>
                [...this.allReactions.value.values()].filter(
                    (x) => x.content == content,
                ).length,
        );
    };

    reactionsThumbsUpCount = this.generateReactionCountProxyState(
        ReactionSymbols.ThumbsUp,
    );
    reactionsCheckCount = this.generateReactionCountProxyState(
        ReactionSymbols.Check,
    );
    reactionsStopCount = this.generateReactionCountProxyState(
        ReactionSymbols.Stop,
    );
    reactionsAttentionCount = this.generateReactionCountProxyState(
        ReactionSymbols.Attention,
    );
    reactionsDoubleAttentionCount = this.generateReactionCountProxyState(
        ReactionSymbols.DoubleAttention,
    );
    reactionsQuestionCount = this.generateReactionCountProxyState(
        ReactionSymbols.Question,
    );

    // state
    isPresentingInfoModal: React.State<boolean> = new React.State(false);

    // methods
    copyMessage = (): void => {
        navigator.clipboard.writeText(this.body.value);
    };
    resendMessage = (): void => {
        this.messagePageViewModel.sendMessageFromBody(this.body.value);
    };
    decryptMessage = (): void => {
        this.messagePageViewModel.decryptMessage(this);
    };

    reply = (): void => {
        this.messagePageViewModel.setReply(this);
        this.hideInfoModal();
    };
    cancelReply = (): void => {
        if (this.messagePageViewModel.replyingMessage.value != this) return;
        this.messagePageViewModel.setReply(undefined);
    };

    // view
    showInfoModal = (): void => {
        this.isPresentingInfoModal.value = true;
    };

    hideInfoModal = (): void => {
        this.isPresentingInfoModal.value = false;
    };

    // reactions
    handleReaction = (reaction: ChatMessageReaction): void => {
        if (reaction.isDeleting) {
            this.allReactions.remove(reaction.sender);
        } else {
            this.allReactions.set(reaction.sender, reaction);
        }

        if (reaction.sender != this.coreViewModel.settingsModel.username)
            return;
        this.userReaction.value = reaction.isDeleting
            ? undefined
            : reaction.content;
    };

    sendReaction = (content: ReactionSymbols, isDeleting: boolean): void => {
        this.messagePageViewModel.sendReaction(
            this.chatMessage.id,
            content,
            isDeleting,
        );
    };

    // load
    loadData = (): void => {
        this.channel = this.chatMessage.channel;
        this.sender = this.chatMessage.sender;
        this.dateSent = new Date(this.chatMessage.dateSent).toLocaleString();
        this.body.value = this.chatMessage.body;
        this.status.value = this.chatMessage.status;

        if (this.chatMessage.inlineReplyId) {
            this.inlineReply =
                this.messagePageViewModel.chatMessageViewModels.value.get(
                    this.chatMessage.inlineReplyId,
                );
	    this.inlineReply.replies.set(this.chatMessage.id, this);
        }
    };

    // init
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly messagePageViewModel: MessagePageViewModel,
        chatMessage: ChatMessage,
        sentByUser: boolean,
    ) {
        this.chatMessage = chatMessage;
        this.sentByUser = sentByUser;
        this.loadData();

	let hideForReactions: boolean = false;
	let hideForReplyView: boolean = false;

	const updateHiding = () => {
	    this.isHidden.value = hideForReactions || hideForReplyView;
	}

        this.messagePageViewModel.reactionFilter.subscribe((content) => {
            if (content == undefined) {
		hideForReactions = false;
		updateHiding();
                return;
            }

            let count: number = 0;
            switch (content) {
                case ReactionSymbols.ThumbsUp: {
                    count = this.reactionsThumbsUpCount.value;
                    break;
                }
                case ReactionSymbols.Check: {
                    count = this.reactionsCheckCount.value;
                    break;
                }
                case ReactionSymbols.Stop: {
                    count = this.reactionsStopCount.value;
                    break;
                }
                case ReactionSymbols.Attention: {
                    count = this.reactionsAttentionCount.value;
                    break;
                }
                case ReactionSymbols.DoubleAttention: {
                    count = this.reactionsDoubleAttentionCount.value;
                    break;
                }
                case ReactionSymbols.Question: {
                    count = this.reactionsQuestionCount.value;
                    break;
                }
            }

            hideForReactions = count == 0;
	    updateHiding();
        });

	this.messagePageViewModel.replyViewSelectedMessage.subscribe(selectedMessage => {
	    if (selectedMessage == undefined) hideForReplyView = false;
	    else if (selectedMessage.chatMessage.id == this.chatMessage.id) hideForReplyView = false;
	    else if (this.inlineReply != undefined &&  selectedMessage.chatMessage.id == this.inlineReply.chatMessage.id) hideForReplyView = false;
	    else hideForReplyView = true;
	    updateHiding();
	});
    }
}
