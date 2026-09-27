import { v4 } from "uuid";
import ChatListModel from "./chatListModel";
import {
    HandlerManager,
    createTimestamp,
    localeCompare,
    parseValidObject,
    stringify,
} from "../Utility/utility";
import {
    DATA_VERSION,
    ValidObject,
    checkMatchesObjectStructure,
} from "../Utility/typeSafety";
import { decryptString, encryptString } from "../Utility/crypto";
import StorageModel, {
    StorageModelSubPaths,
    filePaths,
} from "../Global/storageModel";
import SettingsModel from "../Global/settingsModel";
import ConnectionModel from "../Global/connectionModel";
import FileModel, { FileContent } from "../Files/fileModel";
import { Colors } from "../../colors";
import ContactListModel from "../Global/contactListModel";

export default class ChatModel {
    // models
    readonly fileModel: FileModel;

    // data
    readonly id: string;
    info: ChatInfoFileContent; /* load function called in constructor */

    get secondaryChannels(): string[] {
        return this.info.secondaryChannels.sort(localeCompare);
    }

    get color(): Colors {
        const color = this.info.color as Colors;
        if ([...Object.values(Colors)].includes(color)) return color;
        return Colors.Standard;
    }

    // handler managers
    readonly chatMessageHandlerManager: HandlerManager<ChatMessage> =
        new HandlerManager();
    readonly reactionHandlerManager: HandlerManager<ChatMessageReaction> =
        new HandlerManager();
    readonly changeHandlerManager: HandlerManager<null> = new HandlerManager();

    // paths
    readonly getBasePath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPaths.Chat,
            filePaths.chat.chatBase(this.id),
        );
    };

    readonly getInfoPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPaths.Chat,
            filePaths.chat.info(this.id),
        );
    };

    readonly getColorPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPaths.Chat,
            filePaths.chat.color(this.id),
        );
    };

    readonly getMessageDirPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPaths.Chat,
            filePaths.chat.messages(this.id),
        );
    };

    readonly getMessagePath = (id: string): string[] => {
        return [...this.getMessageDirPath(), id];
    };

    readonly getReactionDirPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPaths.Chat,
            filePaths.chat.reactions(this.id),
        );
    };
    readonly getReactionPath = (id: string): string[] => {
        return [...this.getReactionDirPath(), id];
    };

    readonly getPreviousFilterPath = (): string[] => {
        return [
            StorageModelSubPaths.Chat,
            ...filePaths.chat.previousFilter(this.id),
        ];
    };

    // handlers
    readonly handleMessage = (body: string): void => {
        const chatMessage: ChatMessage | null = parseValidObject(
            body,
            ChatMessageReference,
        );
        if (chatMessage == null) return;

        chatMessage.status = ChatMessageStatuses.Received;

        this.addMessage(chatMessage);

        if (chatMessage.stringifiedFile) return;
        this.setReadStatus(true);
    };

    readonly handleReaction = (reaction: ChatMessageReaction | any): void => {
        if (
            !checkMatchesObjectStructure(reaction, ChatMessageReactionReference)
        )
            return;
        const reactionPath: string[] = this.getReactionPath(reaction.fileId);

        if (reaction.isDeleting == true) {
            this.storageModel.remove(reactionPath);
        } else {
            this.storageModel.writeStringifiable(reactionPath, reaction);
        }
        this.reactionHandlerManager.trigger(reaction);
    };

    readonly handleMessageSent = (chatMessage: ChatMessage): void => {
        chatMessage.status = ChatMessageStatuses.Sent;
        this.addMessage(chatMessage);
    };

    // settings
    readonly setName = (name: string): void => {
        this.info.name = name;
        this.storeInfo();
        this.syncInfo();
        this.subscribe();
    };

    readonly setSecondaryChannels = (secondaryChannels: string[]): void => {
        this.info.secondaryChannels = secondaryChannels;
        this.storeInfo();
    };

    readonly setEncryptionKey = (key: string): void => {
        this.info.encryptionKey = key;
        this.storeInfo();
    };

    readonly setColor = (color: Colors): void => {
        this.info.color = color;
        this.syncInfo();
        this.storeInfo();
    };

    // messaging
    readonly addMessage = async (chatMessage: ChatMessage): Promise<void> => {
        await this.decryptMessage(chatMessage);

	this.contactListModel.storeContact(chatMessage.senderId, chatMessage.senderName);

        // message
        if (chatMessage.body != "") {
            const messagePath: string[] = this.getMessagePath(chatMessage.fileId);
            this.storageModel.writeStringifiable(messagePath, chatMessage);
            this.chatMessageHandlerManager.trigger(chatMessage);
        }

        // file
        this.fileModel.handleStringifiedFileContent(
            chatMessage.stringifiedFile,
        );
    };

    readonly getSendingData = (): [string, string, string] => {
        const id: string = this.settingsModel.userid;
        const senderName: string = this.settingsModel.username || "?";

        const allChannels: string[] = [this.id];
        for (const secondaryChannel of this.info.secondaryChannels) {
            allChannels.push(secondaryChannel);
        }

        const combinedChannel: string = allChannels.join("/");

        return [id, senderName, combinedChannel];
    };

    readonly sendMessage = async (
        body: string,
        inlineReplyId?: string,
        fileContent?: FileContent<string>,
    ): Promise<string | false> => {
        const [senderId, senderName, combinedChannel] = this.getSendingData();

        const chatMessage: ChatMessage = await ChatModel.createChatMessage(
            combinedChannel,
            senderId,
            senderName,
            this.info.encryptionKey,
            body,
            inlineReplyId,
            fileContent,
        );

        this.addMessage(chatMessage);
        this.connectionModel.sendMessageOrStore(chatMessage);
        return chatMessage.fileId;
    };

    readonly decryptMessage = async (
        chatMessage: ChatMessage,
    ): Promise<void> => {
        const decryptedBody: string = await decryptString(
            chatMessage.body,
            this.info.encryptionKey,
        );
        const decryptedFile: string = await decryptString(
            chatMessage.stringifiedFile ?? "",
            this.info.encryptionKey,
        );
        chatMessage.body = decryptedBody;
        chatMessage.stringifiedFile = decryptedFile;
    };

    readonly sendReaction = async (
        messageId: string,
        content: ReactionSymbols,
        isDeleting: boolean = false,
    ): Promise<void> => {
        const [senderId, senderName, combinedChannel] = this.getSendingData();

        const reaction = ChatModel.createMessageReaction(
            messageId,
            senderId,
	    senderName,
            content,
            isDeleting,
        );
        this.sendMessage("", undefined, reaction);
        this.handleReaction(reaction);
    };

    readonly subscribe = (): void => {
        this.connectionModel.addChannel(this.id);
    };

    readonly setReadStatus = (hasUnreadMessages: boolean): void => {
        this.info.hasUnreadMessages = hasUnreadMessages;
        this.storeInfo();
    };

    // storage
    readonly storeInfo = (): void => {
        this.storageModel.writeStringifiable(this.getInfoPath(), this.info);
    };

    readonly syncInfo = (): void => {
        this.sendMessage("", undefined, this.info);
    };

    readonly storeFilter = (filter: string): void => {
        this.storageModel.write(this.getPreviousFilterPath(), filter);
    };

    readonly getFilter = (): string => {
        return this.storageModel.read(this.getPreviousFilterPath()) || "";
    };

    readonly delete = () => {
        // untrack
        this.chatListModel.untrackChat(this);

        // delete
        const dirPath: string[] = this.getBasePath();
        this.storageModel.removeRecursively(dirPath);
    };

    // load
    readonly loadInfo = (): void => {
        let info: ChatInfoFileContent | null =
            this.storageModel.readStringifiable(
                this.getInfoPath(),
                ChatInfoReference,
            );
        this.info =
            info || ChatModel.generateChatInfo("0", "0", Colors.Standard);
        this.storeInfo();
    };

    readonly handleInfo = (info: ChatInfoFileContent): void => {
        this.info = info;
        this.changeHandlerManager.trigger(null);
        this.storeInfo();
    };

    get messages(): ChatMessage[] {
        const messageIds: string[] = this.storageModel.list(
            this.getMessageDirPath(),
        );
        if (!Array.isArray(messageIds)) return [];

        const chatMessages: ChatMessage[] = [];
        for (const messageId of messageIds) {
            const messagePath: string[] = this.getMessagePath(messageId);
            const chatMessage: ChatMessage | null =
                this.storageModel.readStringifiable(
                    messagePath,
                    ChatMessageReference,
                );
            if (chatMessage == null) continue;
            chatMessages.push(chatMessage);
        }

        const sorted = chatMessages.sort((a, b) =>
            a.dateSent.localeCompare(b.dateSent),
        );
        return sorted;
    }

    get reactions(): ChatMessageReaction[] {
        const reactionIds: string[] = this.storageModel.list(
            this.getReactionDirPath(),
        );
        if (!Array.isArray(reactionIds)) return [];

        const reactions: ChatMessageReaction[] = [];
        for (const reactionId of reactionIds) {
            const reactionPath: string[] = this.getReactionPath(reactionId);
            const reaction: ChatMessageReaction | null =
                this.storageModel.readStringifiable(
                    reactionPath,
                    ChatMessageReactionReference,
                );
            if (reaction == null) continue;
            reactions.push(reaction);
        }

        return reactions;
    }

    // init
    constructor(
        public storageModel: StorageModel,
        public connectionModel: ConnectionModel,
        public settingsModel: SettingsModel,
        public chatListModel: ChatListModel,
	public contactListModel: ContactListModel,
        chatId: string,
    ) {
        this.id = chatId;

        this.loadInfo();
        this.subscribe();

        this.fileModel = new FileModel(
            this.storageModel,
            this.settingsModel,
            this,
        );
    }

    // utility
    static splitChannel(channelString: string): string[] {
        return channelString.split("/");
    }

    static generateChatInfo = (
        name: string,
        id: string,
        color: Colors,
    ): ChatInfoFileContent => {
        const file = FileModel.createFileContent(id, "chat-info");

        return {
            ...file,

            name,
            secondaryChannels: [],
            encryptionKey: "",
            color,
            hasUnreadMessages: false,
        };
    };

    static createChatMessage = async (
        channel: string,
        senderId: string,
        senderName: string,
        encryptionKey: string,
        body: string,
        inlineReplyId?: string,
        fileContent?: FileContent<string>,
    ): Promise<ChatMessage> => {
	const messageFileContent = FileModel.createFileContent(v4(), "message");

        const chatMessage: ChatMessage = {
	    ...messageFileContent,

            channel,
            senderName,
            senderId,
            body,
            dateSent: createTimestamp(),
            inlineReplyId,

            status: ChatMessageStatuses.Outbox,
            stringifiedFile: "",
        };
        if (fileContent != undefined) {
            const stringifiedFile: string = stringify(fileContent);
            chatMessage.stringifiedFile = stringifiedFile;
        }

        if (encryptionKey != "") {
            chatMessage.body = await encryptString(
                chatMessage.body,
                encryptionKey,
            );
            chatMessage.stringifiedFile = await encryptString(
                chatMessage.stringifiedFile,
                encryptionKey,
            );
        }

        return chatMessage;
    };

    static createMessageReaction = (
        messageId: string,
        senderId: string,
        senderName: string,
        content: ReactionSymbols,
        isDeleting: boolean,
    ): ChatMessageReaction => {
        const fileContent: FileContent<"reaction"> =
            FileModel.createFileContent(v4(), "reaction");
        const reaction: ChatMessageReaction = {
            ...fileContent,
            fileId: ChatModel.createMessageReactionId(messageId, senderId),

            messageId,
            senderId,
	    senderName,
            content,
            isDeleting,
        };
        return reaction;
    };

    static createMessageReactionId = (
        messageId: string,
        senderId: string,
    ): string => {
        return messageId + senderId;
    };
}

// types
export enum ReactionSymbols {
    ThumbsUp = "👍",
    Check = "✅",
    Stop = "🛑",
    Attention = "❗️",
    DoubleAttention = "‼️",
    Question = "❓",
}

export interface ChatInfoFileContent extends FileContent<"chat-info"> {
    name: string;
    secondaryChannels: string[];
    encryptionKey: string;

    color: string;

    hasUnreadMessages: boolean;
}

export enum ChatMessageStatuses {
    Outbox = "outbox",
    Sent = "sent",
    Received = "received",
    Other = "other",
}

export interface ChatMessage extends FileContent<"message"> {
    readonly channel: string;
    readonly senderId: string;
    readonly senderName: string;
    body: string;
    readonly dateSent: string;
    readonly inlineReplyId?: string;

    status: ChatMessageStatuses;

    stringifiedFile: string;
}

export interface ChatMessageReaction
    extends FileContent<"reaction"> {
    readonly messageId: string;
    readonly senderId: string;
    readonly senderName: string;
    readonly content: ReactionSymbols | string;
    isDeleting: boolean;
}

// references
export const ChatInfoReference: ChatInfoFileContent = {
    dataVersion: DATA_VERSION,

    fileId: "",
    fileContentId: "",
    creationDate: "",

    type: "chat-info",

    name: "",
    secondaryChannels: [""],
    encryptionKey: "",

    color: "",

    hasUnreadMessages: true,
};

export const ChatMessageReference: ChatMessage = {
    dataVersion: DATA_VERSION,
    
    fileId: "",
    fileContentId: "",
    creationDate: "",
    type: "message",

    channel: "",
    senderName: "",
    senderId: "",
    body: "",
    dateSent: "",

    status: "" as ChatMessageStatuses,

    stringifiedFile: "",
};

export const ChatMessageReactionReference: ChatMessageReaction = {
    dataVersion: DATA_VERSION,

    fileId: "",
    fileContentId: "",
    creationDate: "",
    type: "reaction",

    messageId: "",
    senderId: "",
    senderName: "",
    content: "",

    isDeleting: false,
};
