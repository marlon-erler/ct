// cleanup: Phase A

import UDNFrontend, { Message } from "udn-frontend";
import StorageModel, { StorageModelSubPaths, filePaths } from "./storageModel";
import { HandlerManager, stringify } from "../Utility/utility";
import { ChatMessage, ChatMessageReference } from "../Chat/chatModel";

export default class ConnectionModel {
    // models etc
    readonly udn: UDNFrontend;
    readonly storageModel: StorageModel;

    // config
    reconnectInterval: number | undefined = undefined;
    shouldAttemptReconnect: boolean = false;

    // data
    get isConnected(): boolean {
        return this.udn.ws != undefined && this.udn.ws.readyState == 1;
    }

    get address(): string | undefined {
        return this.udn.ws?.url;
    }

    // handler managers
    readonly connectionChangeHandlerManager = new HandlerManager<void>();
    readonly messageHandlerManager = new HandlerManager<Message>();
    readonly messageSentHandlerManager = new HandlerManager<ChatMessage>();
    readonly channelsToSubscribe = new Set<string>();

    // handlers
    readonly handleMessage = (data: Message): void => {
        this.messageHandlerManager.trigger(data);
    };

    readonly handleConnectionChange = (): void => {
        console.log("connection status:", this.isConnected, this.address);
        this.connectionChangeHandlerManager.trigger();
        if (this.address == undefined) return;

        this.storeAddress(this.address);
        this.sendSubscriptionRequest();
        this.sendMessagesInOutbox();
    };

    // connection
    readonly connect = (address: string): void => {
        console.log("connecting...", address);
        this.shouldAttemptReconnect = true;
        this.udn.connect(address);
    };

    readonly disconnect = (): void => {
        this.shouldAttemptReconnect = false;
        this.udn.disconnect();

        // do not reconnect
        const reconnectAddressPath: string[] = StorageModel.getPath(
            StorageModelSubPaths.ConnectionModel,
            filePaths.connectionModel.reconnectAddress,
        );
        this.storageModel.remove(reconnectAddressPath);
    };

    readonly reconnect = (): void => {
        const reconnectAddressPath: string[] = this.getReconnectAddressPath();
        const reconnectAddress: string | null =
            this.storageModel.read(reconnectAddressPath);
        if (reconnectAddress == null) return;

        console.log("reconnecting...");
        this.connect(reconnectAddress);
    };

    // mailbox
    readonly getMailboxPath = (address: string): string[] => {
        const mailboxDirPath = StorageModel.getPath(
            StorageModelSubPaths.ConnectionModel,
            filePaths.connectionModel.mailboxes,
        );
        const mailboxFilePath: string[] = [...mailboxDirPath, address];
        return mailboxFilePath;
    };

    readonly requestNewMailbox = (): void => {
        console.log("requesting new mailbox");
        this.udn.requestMailbox();
    };

    readonly connectMailbox = (): void => {
        if (this.address == undefined) return;

        const mailboxId = this.storageModel.read(
            this.getMailboxPath(this.address),
        );
        console.log("connecting mailbox", mailboxId);
        if (mailboxId == null) return this.requestNewMailbox();

        this.udn.connectMailbox(mailboxId);
    };

    readonly storeMailbox = (mailboxId: string): void => {
        if (this.address == undefined) return;
        this.storageModel.write(this.getMailboxPath(this.address), mailboxId);
    };

    // subscription
    readonly addChannel = (channel: string): void => {
        this.channelsToSubscribe.add(channel);
        this.sendSubscriptionRequest();
    };

    readonly sendSubscriptionRequest = (): void => {
        if (this.isConnected == false) return;

        for (const channel of this.channelsToSubscribe) {
            this.udn.subscribe(channel);
        }
        // update mailbox
        this.connectMailbox();
    };

    // outbox
    readonly getOutboxPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPaths.ConnectionModel,
            filePaths.connectionModel.outbox,
        );
    };

    readonly getOutboxMessags = (): ChatMessage[] => {
        const outboxPath: string[] = this.getOutboxPath();
        const messageIds: string[] = this.storageModel.list(outboxPath);

        let chatMessages: ChatMessage[] = [];
        for (const messageId of messageIds) {
            const chatMessage: ChatMessage | null =
                this.storageModel.readStringifiable(
                    [...outboxPath, messageId],
                    ChatMessageReference,
                );

            if (chatMessage == null) continue;
            chatMessages.push(chatMessage);
        }

        return chatMessages;
    };

    readonly addToOutbox = (chatMessage: ChatMessage): void => {
        const messagePath: string[] = [...this.getOutboxPath(), chatMessage.fileId];
        this.storageModel.writeStringifiable(messagePath, chatMessage);
    };

    readonly removeFromOutbox = (chatMessage: ChatMessage): void => {
        const messagePath: string[] = [...this.getOutboxPath(), chatMessage.fileId];
        this.storageModel.remove(messagePath);
    };

    readonly sendMessagesInOutbox = (): void => {
        const messages: ChatMessage[] = this.getOutboxMessags();

        for (const message of messages) {
            const isSent: boolean = this.tryToSendMessage(message);
            if (isSent == false) return;

            this.removeFromOutbox(message);
        }
    };

    // messaging
    readonly sendMessageOrStore = (chatMessage: ChatMessage): void => {
        const isSent = this.tryToSendMessage(chatMessage);
        if (isSent == true) return;

        this.addToOutbox(chatMessage);
    };

    readonly tryToSendMessage = (chatMessage: ChatMessage): boolean => {
        const stringifiedBody: string = stringify(chatMessage);
        const isSent: boolean = this.sendPlainMessage(
            chatMessage.channel,
            stringifiedBody,
        );
        if (isSent) this.messageSentHandlerManager.trigger(chatMessage);
        return isSent;
    };

    readonly sendPlainMessage = (channel: string, body: string): boolean => {
        return this.udn.sendMessage(channel, body);
    };

    // storage
    readonly getPreviousAddressPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPaths.ConnectionModel,
            filePaths.connectionModel.previousAddresses,
        );
    };

    readonly getAddressPath = (address: string): string[] => {
        const dirPath = this.getPreviousAddressPath();
        return [...dirPath, address];
    };

    readonly getReconnectAddressPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPaths.ConnectionModel,
            filePaths.connectionModel.reconnectAddress,
        );
    };

    readonly storeAddress = (address: string): void => {
        // history
        const addressPath = this.getAddressPath(address);
        this.storageModel.write(addressPath, "");

        // reconnect
        const reconnectAddressPath: string[] = this.getReconnectAddressPath();
        this.storageModel.write(reconnectAddressPath, address);
    };

    readonly removeAddress = (address: string): void => {
        const addressPath = this.getAddressPath(address);
        this.storageModel.remove(addressPath);
    };

    get addresses(): string[] {
        const dirPath = this.getPreviousAddressPath();
        return this.storageModel.list(dirPath);
    }

    // init
    constructor(storageModel: StorageModel) {
        // create frontend
        this.udn = new UDNFrontend();
        this.storageModel = storageModel;

        // setup handlers
        this.udn.onmessage = (data: Message) => {
            this.handleMessage(data);
        };
        this.udn.onconnect = () => {
            this.handleConnectionChange();
        };
        this.udn.ondisconnect = () => {
            this.handleConnectionChange();
        };

        this.udn.onmailboxcreate = (mailboxId: string) => {
            console.log("created mailbox", mailboxId);
            this.storeMailbox(mailboxId);
            this.connectMailbox();
        };
        this.udn.onmailboxdelete = (mailboxId: string) => {
            console.log(`mailbox ${mailboxId} deleted`);
            this.requestNewMailbox();
        };
        this.udn.onmailboxconnect = (mailboxId: string) => {
            console.log(`using mailbox ${mailboxId}`);
        };

        setInterval(() => {
            if (this.isConnected == true) return;
            if (this.shouldAttemptReconnect == false) return;
            this.reconnect();
        }, 5000);
        this.reconnect();
    }
}

// paths
export enum settingsModelStorageFiles {
    username = "user-name",
    firstDayOfWeek = "first-day-of-week",
}
