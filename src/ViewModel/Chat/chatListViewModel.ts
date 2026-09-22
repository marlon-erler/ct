import ChatViewModel from "./chatViewModel";
import SettingsViewModel from "../Global/settingsViewModel";
import NotificationViewModel from "../Global/notificationViewModel";
import CoreViewModel from "../Global/coreViewModel";
import ConnectionViewModel from "../Global/connectionViewModel";
import * as React from "../../react";
import { IndexManager } from "../../Model/Utility/utility";
import ChatModel from "../../Model/Chat/chatModel";

export default class ChatListViewModel {
    notificationViewModel: NotificationViewModel;

    // data
    readonly chatIndexManager = new IndexManager<ChatViewModel>(
        (chatViewModel: ChatViewModel) =>
            chatViewModel.settingsPageViewModel.primaryChannel.value,
    );

    // state
    newChatPrimaryChannel: React.State<string> = new React.State("");
    chatViewModels: React.ListState<ChatViewModel> = new React.ListState();

    selectedChat: React.State<ChatViewModel | undefined> = new React.State<any>(
        undefined,
    );

    // guards
    cannotCreateChat = React.createProxyState(
        [this.newChatPrimaryChannel],
        () => this.newChatPrimaryChannel.value == "",
    );

    // methods
    createChat = (): void => {
        const chatModel: ChatModel =
            this.coreViewModel.chatListModel.createChat(
                this.newChatPrimaryChannel.value,
            );
        this.newChatPrimaryChannel.value = "";

        const chatViewModel: ChatViewModel =
            this.createChatViewModel(chatModel);
        this.trackChat(chatViewModel);
        this.updateIndices();
    };

    trackChat = (chatViewModel: ChatViewModel): void => {
        this.chatViewModels.add(chatViewModel);
    };

    untrackChat = (chatViewModel: ChatViewModel): void => {
        this.coreViewModel.chatListModel.untrackChat(chatViewModel.chatModel);
        this.chatViewModels.remove(chatViewModel);
    };

    createChatViewModel = (chatModel: ChatModel): ChatViewModel => {
        return new ChatViewModel(
            this.coreViewModel,
            chatModel,
            this.settingsViewModel,
            this.notificationViewModel,
            this.connectionViewModel,
            this,
        );
    };

    updateIndices = (): void => {
        this.chatIndexManager.update([...this.chatViewModels.value.values()]);
        for (const chatViewModel of this.chatViewModels.value) {
            chatViewModel.updateIndex();
        }
    };

    // view
    openChat = (chatViewModel: ChatViewModel): void => {
        this.selectedChat.value = chatViewModel;
        this.notificationViewModel.skipLoop();
    };

    closeChat = (): void => {
        this.selectedChat.value = undefined;
    };

    // load
    loadChats = (): void => {
        this.chatViewModels.clear();
        for (const chatModel of this.coreViewModel.chatListModel.chatModels.values()) {
            const chatViewModel: ChatViewModel =
                this.createChatViewModel(chatModel);
            this.trackChat(chatViewModel);
        }
        this.updateIndices();
    };

    // init
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly settingsViewModel: SettingsViewModel,
        public readonly connectionViewModel: ConnectionViewModel,
    ) {
        this.notificationViewModel = new NotificationViewModel(this);

        this.loadChats();
    }

    // utility
    stripNamespace = (fullChannel: string): string => {
    	for (const vm of this.chatViewModels.value) {
	    const fullReference = vm.chatModel.info.namespace + vm.chatModel.info.primaryChannel;
	    if (fullReference == fullChannel) return vm.chatModel.info.primaryChannel;
	}

	return fullChannel;
    }
}
