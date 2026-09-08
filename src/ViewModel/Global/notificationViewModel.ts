import * as React from "bloatless-react";
import { ChatPageTypes } from "../Chat/chatViewModel";
import ChatListViewModel from "../Chat/chatListViewModel";
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
        const notification: Notification =
            NotificationViewModel.createNotification(message);
        if (this.seenMessageIds.has(message.id)) return;

        if (this.chatListViewModel.selectedChat.value == undefined) return;

        const currentChat =
            this.chatListViewModel.selectedChat.value.chatModel
                .unwrappedPrimaryChannel;
        const currentPage =
            this.chatListViewModel.selectedChat.value.selectedPage.value;
        if (
            notification.chat == currentChat &&
            currentPage == ChatPageTypes.Messages
        )
            return;

        this.messagesInMarquee.push(notification);
        this.startLoop();
    };

    openNotification = () => {
        const notification: Notification|undefined = this.marquee.value;
        if (notification == undefined) return;

        const chat = [
            ...this.chatListViewModel.chatViewModels.value.values(),
        ].find(
            (chat) =>
                chat.chatModel.unwrappedPrimaryChannel == notification.chat,
        );
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

        const notification: Notification|undefined = this.messagesInMarquee.shift();
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
    constructor(public readonly chatListViewModel: ChatListViewModel) {}

    // util
    static createNotification(message: ChatMessage): Notification {
        return {
            messageId: message.id,
            chat: ChatModel.splitChannel(message.channel)[0],
            sender: message.sender,
            body: message.body,
        };
    }
}

export interface Notification {
    messageId: string;
    chat: string;
    sender: string;
    body: string;
}
