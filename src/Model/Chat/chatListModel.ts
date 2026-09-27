// cleanup: Phase A

import { v4 } from "uuid";
import { Message } from "udn-frontend";
import ChatModel, { ChatMessage } from "./chatModel";
import StorageModel, {
    StorageModelSubPaths,
    filePaths,
} from "../Global/storageModel";
import SettingsModel from "../Global/settingsModel";
import ConnectionModel from "../Global/connectionModel";
import ContactListModel from "../Global/contactListModel";

export default class ChatListModel {
    // data
    readonly chatModels = new Set<ChatModel>();

    // chat handling
    readonly addChatModel = (chatModel: ChatModel) => {
        this.chatModels.add(chatModel);
    };

    readonly createChat = (primaryChannel: string): ChatModel => {
        const id: string = v4();

        const chatModel = new ChatModel(
            this.storageModel,
            this.connectionModel,
            this.settingsModel,
            this,
	    this.contactListModel,
            id,
        );
        chatModel.setName(primaryChannel);

        this.addChatModel(chatModel);
        return chatModel;
    };

    readonly untrackChat = (chat: ChatModel): void => {
        this.chatModels.delete(chat);
    };

    // message handlers
    readonly messageHandler = (data: Message): void => {
        const channel: string | undefined = data.messageChannel;
        const body: string | undefined = data.messageBody;
        if (channel == undefined) return;
        if (body == undefined) return;

        this.routeMessageToCorrectChatModel(channel, (chatModel: ChatModel) =>
            chatModel.handleMessage(body),
        );
    };

    readonly messageSentHandler = (chatMessage: ChatMessage): void => {
        const channel: string = chatMessage.channel;

        this.routeMessageToCorrectChatModel(channel, (chatModel: ChatModel) =>
            chatModel.handleMessageSent(chatMessage),
        );
    };

    // util
    readonly routeMessageToCorrectChatModel = (
        channel: string,
        fn: (chatModel: ChatModel) => void,
    ): void => {
        const allChannels: string[] = channel.split("/");

        for (const chatModel of this.chatModels) {
            for (const channel of allChannels) {
                if (channel != chatModel.id) continue;
                fn(chatModel);
                break;
            }
        }
    };

    // load
    readonly loadChats = (): void => {
        const chatDir = StorageModel.getPath(
            StorageModelSubPaths.Chat,
            filePaths.chat.base,
        );
        const chatIds = this.storageModel.list(chatDir);
        for (const chatId of chatIds) {
            const chatModel = new ChatModel(
                this.storageModel,
                this.connectionModel,
                this.settingsModel,
                this,
		this.contactListModel,
                chatId,
            );
            this.addChatModel(chatModel);
        }
    };

    // init
    constructor(
        public storageModel: StorageModel,
        public settingsModel: SettingsModel,
        public connectionModel: ConnectionModel,
	public contactListModel: ContactListModel
    ) {
        this.loadChats();

        this.connectionModel.messageHandlerManager.setHandler(
            "chat-list",
            this.messageHandler,
        );
        this.connectionModel.messageSentHandlerManager.setHandler(
            "chat-list",
            this.messageSentHandler,
        );
    }
}
