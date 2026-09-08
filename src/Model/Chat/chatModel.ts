// cleanup: Phase A

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

export default class ChatModel {
    // models
    readonly connectionModel: ConnectionModel;
    readonly storageModel: StorageModel;
    readonly settingsModel: SettingsModel;
    readonly chatListModel: ChatListModel;
    readonly fileModel: FileModel;

    // data
    readonly id: string;
    info: ChatInfo; /* load function called in constructor */
    color: Colors = Colors.Standard;

    get unwrappedPrimaryChannel(): string {
        return this.info.namespace + this.info.primaryChannel;
    }

    get secondaryChannels(): string[] {
        return this.info.secondaryChannels.sort(localeCompare);
    }

    // handler managers
    chatMessageHandlerManager: HandlerManager<ChatMessage> =
        new HandlerManager();
    readonly reactionHandlerManager: HandlerManager<ChatMessageReaction> =
        new HandlerManager();

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
    readonly setPrimaryChannel = (primaryChannel: string): void => {
        this.info.primaryChannel = primaryChannel;
        this.storeInfo();
        this.subscribe();
    };

    readonly setNamespace = (namespace: string): void => {
        this.info.namespace = namespace;
        this.storeInfo();
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
        this.color = color;
        this.storeColor();
    };

    // messaging
    readonly addMessage = async (chatMessage: ChatMessage): Promise<void> => {
        await this.decryptMessage(chatMessage);

        // message
        if (chatMessage.body != "") {
            const messagePath: string[] = this.getMessagePath(chatMessage.id);
            this.storageModel.writeStringifiable(messagePath, chatMessage);
            this.chatMessageHandlerManager.trigger(chatMessage);
        }

        // file
        this.fileModel.handleStringifiedFileContent(
            chatMessage.stringifiedFile,
        );
    };

    readonly getNameAndChannel = (): [string, string] | false => {
        const senderName: string = this.settingsModel.username;
        if (senderName == "") return false;

        const allChannels: string[] = [this.unwrappedPrimaryChannel];
        for (const secondaryChannel of this.info.secondaryChannels) {
            allChannels.push(secondaryChannel);
        }

        const combinedChannel: string = allChannels.join("/");

        return [senderName, combinedChannel];
    };

    readonly sendMessage = async (
        body: string,
        inlineReplyId?: string,
        fileContent?: FileContent<string>,
    ): Promise<boolean> => {
        const nameAndChannel = this.getNameAndChannel();
        if (nameAndChannel == false) return false;
        const [senderName, combinedChannel] = nameAndChannel;

        const chatMessage: ChatMessage = await ChatModel.createChatMessage(
            combinedChannel,
            senderName,
            this.info.encryptionKey,
            body,
            inlineReplyId,
            fileContent,
        );

        this.addMessage(chatMessage);
        this.connectionModel.sendMessageOrStore(chatMessage);
        return true;
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
        const nameAndChannel = this.getNameAndChannel();
        if (nameAndChannel == false) return;
        const [senderName] = nameAndChannel;

        const reaction = ChatModel.createMessageReaction(
            messageId,
            senderName,
            content,
            isDeleting,
        );
        this.sendMessage("", undefined, reaction);
        this.handleReaction(reaction);
    };

    readonly subscribe = (): void => {
        this.connectionModel.addChannel(this.unwrappedPrimaryChannel);
    };

    readonly setReadStatus = (hasUnreadMessages: boolean): void => {
        this.info.hasUnreadMessages = hasUnreadMessages;
        this.storeInfo();
    };

    // storage
    readonly storeInfo = (): void => {
        this.storageModel.writeStringifiable(this.getInfoPath(), this.info);
    };

    readonly storeColor = (): void => {
        this.storageModel.write(this.getColorPath(), this.color);
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
        const info: ChatInfo | null = this.storageModel.readStringifiable(
            this.getInfoPath(),
            ChatInfoReference,
        );
        if (info != null) {
            this.info = info;
        } else {
            this.info = ChatModel.generateChatInfo("0");
        }
    };

    readonly loadColor = (): void => {
        const path: string[] = this.getColorPath();
        const color: string | null = this.storageModel.read(path);
        if (!color) {
            this.color = Colors.Standard;
        } else {
            this.color = color as any;
        }
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
        storageModel: StorageModel,
        connectionModel: ConnectionModel,
        settingsModel: SettingsModel,
        chatListModel: ChatListModel,
        chatId: string,
    ) {
        this.id = chatId;
        this.connectionModel = connectionModel;
        this.settingsModel = settingsModel;
        this.storageModel = storageModel;
        this.chatListModel = chatListModel;

        this.loadInfo();
        this.loadColor();
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

    static generateChatInfo = (primaryChannel: string): ChatInfo => {
        return {
            dataVersion: DATA_VERSION,

            primaryChannel,
            namespace: "",
            secondaryChannels: [],
            encryptionKey: "",
            hasUnreadMessages: false,
        };
    };

    static createChatMessage = async (
        channel: string,
        sender: string,
        encryptionKey: string,
        body: string,
        inlineReplyId?: string,
        fileContent?: FileContent<string>,
    ): Promise<ChatMessage> => {
        const chatMessage: ChatMessage = {
            dataVersion: DATA_VERSION,

            id: v4(),

            channel,
            sender,
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
        sender: string,
        content: ReactionSymbols,
        isDeleting: boolean,
    ): ChatMessageReaction => {
        const fileContent: FileContent<"reaction"> =
            FileModel.createFileContent(v4(), "reaction");
        const reaction: ChatMessageReaction = {
            ...fileContent,
            fileId: ChatModel.createMessageReactionId(messageId, sender),

            messageId,
            sender,
            content,
            isDeleting,
        };
        return reaction;
    };

    static createMessageReactionId = (
        messageId: string,
        sender: string,
    ): string => {
        return messageId + sender;
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

export interface ChatInfo extends ValidObject {
    primaryChannel: string;
    namespace: string;
    secondaryChannels: string[];
    encryptionKey: string;

    hasUnreadMessages: boolean;
}

export enum ChatMessageStatuses {
    Outbox = "outbox",
    Sent = "sent",
    Received = "received",
    Other = "other",
}

export interface ChatMessage extends ValidObject {
    readonly id: string;

    readonly channel: string;
    readonly sender: string;
    body: string;
    readonly dateSent: string;
    readonly inlineReplyId?: string;

    status: ChatMessageStatuses;

    stringifiedFile: string;
}

export interface ChatMessageReaction
    extends ValidObject, FileContent<"reaction"> {
    readonly messageId: string;
    readonly sender: string;
    readonly content: ReactionSymbols | string;
    isDeleting: boolean;
}

// references
export const ChatInfoReference: ChatInfo = {
    dataVersion: DATA_VERSION,

    primaryChannel: "",
    namespace: "",
    secondaryChannels: [""],
    encryptionKey: "",

    hasUnreadMessages: true,
};

export const ChatMessageReference: ChatMessage = {
    dataVersion: DATA_VERSION,

    id: "",

    channel: "",
    sender: "",
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
    sender: "",
    content: "",

    isDeleting: false,
};
