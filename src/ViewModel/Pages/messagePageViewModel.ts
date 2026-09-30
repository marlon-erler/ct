import SearchViewModel from "../Utility/searchViewModel";
import CoreViewModel, { Context } from "../Global/coreViewModel";
import ContactListViewModel from "../Global/contactViewModel";
import ChatViewModel, { ChatPageTypes } from "../Chat/chatViewModel";
import ChatMessageViewModel from "../Chat/chatMessageViewModel";
import * as React from "../../react";
import { CommonKeys } from "../../View/keystrokes";
import {
    ChatMessage,
    ChatMessageReaction,
    ReactionSymbols,
} from "../../Model/Chat/chatModel";

export default class MessagePageViewModel extends Context {
    // state
    chatMessageViewModels: React.MapState<ChatMessageViewModel> =
        new React.MapState();
    filteredMessageViewModels: React.ListState<ChatMessageViewModel> =
        new React.ListState();
    replyViewSelectedMessage = new React.State<
        ChatMessageViewModel | undefined
    >(undefined);
    isReplyViewActive: React.State<boolean> = React.createProxyState(
        [this.replyViewSelectedMessage],
        () => this.replyViewSelectedMessage.value != undefined,
    );
    isReplyViewInactive = React.createProxyState(
        [this.isReplyViewActive],
        () => !this.isReplyViewActive.value,
    );
    searchViewModel: SearchViewModel<ChatMessageViewModel>;
    isFilterModalOpen = new React.State<boolean>(false);
    reactionFilter = new React.State<ReactionSymbols | undefined>(undefined);
    isFilterActive: React.State<boolean>;

    replyingMessage = new React.State<ChatMessageViewModel | undefined>(
        undefined,
    );
    composingMessage = new React.State<string>("");

    focusSetter = new React.State(null);

    // guards
    cannotSendMessage: React.State<boolean>;

    // methods
    sendMessage = async (): Promise<void> => {
        if (this.cannotSendMessage.value == true) return;

        const idPromise = this.sendMessageFromBody(this.composingMessage.value);
        this.composingMessage.value = "";

        const id = await idPromise;
        if (id && this.reactionFilter.value != undefined) {
            this.sendReaction(id, this.reactionFilter.value, false);
        }
    };

    sendMessageFromBody = (body: string): Promise<string | false> => {
        let replyId: string | undefined = undefined;
        if (this.replyingMessage.value) {
            replyId = this.replyingMessage.value.chatMessage.fileId;
        }
        const id = this.chatViewModel.chatModel.sendMessage(body, replyId);

        if (this.replyViewSelectedMessage.value == undefined)
            this.replyingMessage.value = undefined;

        return id;
    };

    decryptMessage = async (
        messageViewModel: ChatMessageViewModel,
    ): Promise<void> => {
        const chatMessage: ChatMessage = messageViewModel.chatMessage;
        await this.chatViewModel.chatModel.decryptMessage(chatMessage);
        this.chatViewModel.chatModel.addMessage(chatMessage);
        messageViewModel.loadData();
    };

    sendReaction = (
        messageId: string,
        content: ReactionSymbols,
        isDeleting: boolean,
    ): void => {
        this.chatViewModel.chatModel.sendReaction(
            messageId,
            content,
            isDeleting,
        );
    };

    setReply = (
        chatMessageViewModel: ChatMessageViewModel | undefined,
        setFocus: boolean = true,
    ): void => {
        this.replyingMessage.value = chatMessageViewModel;
        if (setFocus == false || chatMessageViewModel == undefined) return;
        this.setFocus();
    };

    resetReply = (setFocus: boolean = true): void => {
        this.replyingMessage.value = undefined;
        if (setFocus == false) return;
        this.setFocus();
    };

    // view
    showChatMessage = (chatMessage: ChatMessage): void => {
        const contact = this.contactListViewModel.unwrapContact(
            chatMessage.senderId,
            chatMessage.senderName,
        );
        const chatMessageViewModel = new ChatMessageViewModel(
            this.coreViewModel,
            this,
            chatMessage,
            contact,
            chatMessage.senderId ==
                this.chatViewModel.settingsViewModel.settingsModel.userid,
        );

        const existingChatMessageViewModel: ChatMessageViewModel | undefined =
            this.chatMessageViewModels.value.get(chatMessage.fileId);
        if (existingChatMessageViewModel != undefined) {
            existingChatMessageViewModel.body.value = chatMessage.body;
            existingChatMessageViewModel.status.value = chatMessage.status;
        } else {
            this.chatMessageViewModels.set(
                chatMessage.fileId,
                chatMessageViewModel,
            );
        }
    };

    handleReaction = (reaction: ChatMessageReaction): void => {
        const messageViewModel: ChatMessageViewModel | undefined =
            this.chatMessageViewModels.value.get(reaction.messageId);
        if (messageViewModel == undefined) return;
        messageViewModel.handleReaction(reaction);
    };

    showFilterModal = (): void => {
        this.isFilterModalOpen.value = true;
    };

    hideFilterModal = (): void => {
        this.isFilterModalOpen.value = false;
    };

    revokeReactionFilter = (persist: boolean = true): void => {
        this.reactionFilter.value = undefined;
        if (persist) this.chatViewModel.chatModel.storeFilter("");
    };

    setReactionFilter = (content: ReactionSymbols): void => {
        this.reactionFilter.value = content;
        this.chatViewModel.chatModel.storeFilter(content);
    };

    resetFilter = (): void => {
        this.revokeReactionFilter();
        this.searchViewModel.search("");
    };

    setReplyView = (message: ChatMessageViewModel): void => {
        this.replyViewSelectedMessage.value = message;
        this.revokeReactionFilter(false);
        this.setReply(message, false);
    };

    resetReplyView = (): void => {
        this.replyViewSelectedMessage.value = undefined;
        this.resetReply(false);
        this.restoreFilter();
    };

    setFocus = (): void => {
        this.focusSetter.callSubscriptions();
    };

    // load
    loadData = (): void => {
        this.chatMessageViewModels.clear();
        for (const chatMessage of this.chatViewModel.chatModel.messages) {
            this.showChatMessage(chatMessage);
        }
        for (const reaction of this.chatViewModel.chatModel.reactions) {
            this.handleReaction(reaction);
        }
    };

    restoreFilter = (): void => {
        const previousFilter = this.chatViewModel.chatModel.getFilter() as any;
        if (Object.values(ReactionSymbols).includes(previousFilter))
            this.setReactionFilter(previousFilter);
    };

    // context
    handleContextClose = (fromHistoryEvent: boolean):boolean=> {
	if (fromHistoryEvent) {
	    if (this.replyViewSelectedMessage.value == undefined) return true;

	    this.resetReplyView();
	    return false;
	}
    }

    // init
    constructor(
	public readonly coreViewModel: CoreViewModel,
	public readonly chatViewModel: ChatViewModel,
	public readonly contactListViewModel: ContactListViewModel,
    ) {
	super("message-page");
	this.restoreFilter();

	// states
	this.cannotSendMessage = React.createProxyState(
	    [
		this.chatViewModel.settingsViewModel.username,
		this.composingMessage,
	    ],
	    () =>
	    this.chatViewModel.settingsViewModel.username.value == "" ||
	    this.composingMessage.value == "",
	);

	this.searchViewModel = new SearchViewModel(
	    this.chatMessageViewModels,
	    this.filteredMessageViewModels,
	    (chatMessageViewModel) => [chatMessageViewModel.body.value],
	    new React.ListState(),
	);

	this.isFilterActive = React.createProxyState(
	    [this.searchViewModel.appliedQuery, this.reactionFilter],
	    () =>
	    this.searchViewModel.appliedQuery.value != "" ||
	    this.reactionFilter.value != undefined,
	);

	// keystrokes
	this.registerKeyStroke(CommonKeys.Filter, this.showFilterModal);
	this.registerKeyStroke(CommonKeys.CloseOrCancel, () => {
	    if (this.isFilterModalOpen.value == true) {
		this.hideFilterModal();
	    } else {
		this.replyingMessage.value = undefined;
	    }
	});
	this.registerKeyStroke(CommonKeys.Reset, this.resetFilter);
	this.registerKeyStroke(CommonKeys.Create, this.setFocus);

	this.chatViewModel.registerContext(ChatPageTypes.Messages, this);
    }
}
