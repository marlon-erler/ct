import { ChatPageTypes } from "../Chat/chatViewModel";
import ChatListViewModel from "../Chat/chatListViewModel";
import * as React from "../../react";
import ChatModel, { ChatMessage } from "../../Model/Chat/chatModel";

export default class NotificationViewModel {
    // data
    seenMessageIds = new Set<string>();
    messagesInMarquee: Notification[] = [];
    marquee = new React.State<Notification | undefined>(undefined);
    currentIndex = 0;
    interval: number | undefined = undefined;

    // main
    showNotification = (message: ChatMessage): void => {
        if (this.seenMessageIds.has(message.id)) return;
        if (this.chatListViewModel.selectedChat.value == undefined) return;

        const notification: Notification = this.createNotification(message);
        const currentChat =
            this.chatListViewModel.selectedChat.value.chatModel.id;
        const currentPage =
            this.chatListViewModel.selectedChat.value.selectedPage.value;
        if (
            notification.fullChannel == currentChat &&
            currentPage == ChatPageTypes.Messages
        )
            return;

        this.messagesInMarquee.push(notification);
        this.startLoop();
    };

    openNotification = () => {
        const notification: Notification | undefined = this.marquee.value;
        if (notification == undefined) return;

        const chat = [
            ...this.chatListViewModel.chatViewModels.value.values(),
        ].find((chat) => chat.chatModel.id == notification.fullChannel);
        if (!chat) return;
        chat.open();
        chat.openPage(ChatPageTypes.Messages);
    };

    // loop
    loop = () => {
        if (this.messagesInMarquee.length == 0) {
            this.marquee.value = undefined;
            return this.stopLoop();
        }

        const notification: Notification | undefined =
            this.messagesInMarquee.shift();
        if (!notification) return;
        this.seenMessageIds.delete(notification.messageId);
        this.marquee.value = notification;
    };

    startLoop = () => {
        if (this.interval != undefined) return;

        this.loop();
        this.interval = setInterval(() => {
            this.loop();
        }, 5000);
    };

    stopLoop = () => {
        clearInterval(this.interval);
        this.interval = undefined;
    };

    skipLoop = () => {
        this.stopLoop();
        this.startLoop();
    };

    // init
    constructor(public chatListViewModel: ChatListViewModel) {}

    // util
    createNotification(message: ChatMessage): Notification {
        const fullChannel = ChatModel.splitChannel(message.channel)[0];
        const chat = this.chatListViewModel.getDisplayName(fullChannel);
        return {
            messageId: message.id,
            chat,
            fullChannel,
            sender: message.senderName,
            body: message.body,
        };
    }
}

export interface Notification {
    messageId: string;
    chat: string;
    fullChannel: string;
    sender: string;
    body: string;
}
