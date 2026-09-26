import ChatListViewModel from "./chatListViewModel";
import TaskPageViewModel from "../Pages/taskPageViewModel";
import SettingsPageViewModel from "../Pages/settingsPageViewModel";
import MessagePageViewModel from "../Pages/messagePageViewModel";
import CalendarPageViewModel, {
    CALENDAR_EVENT_BOARD_ID,
} from "../Pages/calendarPageViewModel";
import SettingsViewModel from "../Global/settingsViewModel";
import NotificationViewModel from "../Global/notificationViewModel";
import CoreViewModel, { Context, ContextHost } from "../Global/coreViewModel";
import ConnectionViewModel from "../Global/connectionViewModel";
import * as React from "../../react";
import { Colors } from "../../colors";
import { CommonKeys } from "../../View/keystrokes";
import { Entry } from "../../View/Components/option";
import StorageModel, {
    StorageModelSubPaths,
    filePaths,
} from "../../Model/Global/storageModel";
import ChatModel, {
    ChatMessage,
    ChatMessageReaction,
} from "../../Model/Chat/chatModel";

export default class ChatViewModel extends ContextHost<ChatPageTypes> {
    calendarViewModel: CalendarPageViewModel;
    taskPageViewModel: TaskPageViewModel;
    messagePageViewModel: MessagePageViewModel;
    settingsPageViewModel: SettingsPageViewModel;

    // state
    displayedColor: React.State<Colors> = new React.State<any>(Colors.Standard);
    selectedPage: React.State<ChatPageTypes> = new React.State<any>(
	ChatPageTypes.Messages,
    );
    pageContexts = new React.MapState<Context>();

    index: React.State<number> = new React.State(0);
    hasUnreadMessages: React.State<boolean> = new React.State(false);

    taskBoardSuggestions: React.MapState<Entry> = new React.MapState();

    // context
    get isOpen(): boolean {
	return this.chatListViewModel.selectedChat.value == this;
    }

    get contextSelection(): ChatPageTypes {
	return this.selectedPage.value;
    }

    // view
    open = (): void => {
	this.coreViewModel.context = this;
	this.chatListViewModel.openChat(this);
	//this.selectedPage.callSubscriptions();
    };

    openPage = (page: ChatPageTypes): void => {
	this.closeCurrentContext();
	this.selectedPage.value = page;
    };

    setColor = (color: Colors): void => {
	this.setDisplayedColor(color);
	this.chatModel.setColor(color);
    };

    setDisplayedColor = (color: Colors): void => {
	this.displayedColor.value = color;
    };

    resetColor = (): void => {
	this.displayedColor.value = this.settingsPageViewModel.color.value;
    };

    updateIndex = (): void => {
	const index: number =
	    this.chatListViewModel.chatIndexManager.getIndex(this);
	this.index.value = index;
    };

    // load
    loadPageSelection = (): void => {
	const path: string[] = StorageModel.getPath(
	    StorageModelSubPaths.Chat,
	    filePaths.chat.lastUsedPage(this.chatModel.id),
	);
	const lastUsedPage: string | null =
	    this.coreViewModel.storageModel.read(path);
	if (lastUsedPage != null) {
	    this.openPage(lastUsedPage as ChatPageTypes);
	}

	this.selectedPage.subscribeSilent((newPage) => {
	    this.coreViewModel.storageModel.write(path, newPage);
	    this.resetColor();
	});
    };

    loadInfo = (): void => {
	this.updateReadStatus();
	this.taskBoardSuggestions.set(CALENDAR_EVENT_BOARD_ID, [
	    CALENDAR_EVENT_BOARD_ID,
	    this.coreViewModel.translations.chatPage.calendar.eventsBoard,
	]);
    };

    updateReadStatus = (): void => {
	if (
	    this.chatListViewModel.selectedChat.value == this &&
	    this.selectedPage.value == ChatPageTypes.Messages
	) {
	    this.chatModel.setReadStatus(false);
	}
	this.hasUnreadMessages.value = this.chatModel.info.hasUnreadMessages;
    };

    setReadStatus = (hasUnreadMessages: boolean): void => {
	this.chatModel.setReadStatus(hasUnreadMessages);
	this.hasUnreadMessages.value = hasUnreadMessages;
    };

    subscribeReadStatus = (): void => {
	React.createProxyState(
	    [this.selectedPage, this.chatListViewModel.selectedChat],
	    () => {
		if (this.chatListViewModel.selectedChat.value != this) return;
		if (this.selectedPage.value != ChatPageTypes.Messages) return;
		this.setReadStatus(false);
	    },
	);
    };

    // exit
    close = (): void => {
	this.coreViewModel.closeContext(this.contextId);
    };

    handleContextClose = (): void => {
	this.chatListViewModel.closeChat();
    };

    // init
    constructor(
	readonly coreViewModel: CoreViewModel,
	public readonly chatModel: ChatModel,
	public readonly settingsViewModel: SettingsViewModel,
	public readonly notificationViewModel: NotificationViewModel,
	public readonly connectionViewModel: ConnectionViewModel,
	public readonly chatListViewModel: ChatListViewModel,
    ) {
	super("chat", coreViewModel);

	// page viewModels
	this.calendarViewModel = new CalendarPageViewModel(
	    coreViewModel,
	    this,
	    this.chatModel.fileModel.boardsAndTasksModel.calendarModel,
	    this.chatModel.fileModel.boardsAndTasksModel,
	);
	this.taskPageViewModel = new TaskPageViewModel(
	    this.coreViewModel,
	    this,
	    this.chatModel.fileModel.boardsAndTasksModel,
	);
	this.messagePageViewModel = new MessagePageViewModel(
	    this.coreViewModel,
	    this,
	);
	this.settingsPageViewModel = new SettingsPageViewModel(
	    this.coreViewModel,
	    this,
	);

	// handlers
	chatModel.chatMessageHandlerManager.setHandler(
	    this.chatModel.id,
	    (chatMessage: ChatMessage) => {
		this.messagePageViewModel.showChatMessage(chatMessage);
		this.updateReadStatus();

		this.notificationViewModel.showNotification(chatMessage);
	    },
	);
	chatModel.reactionHandlerManager.setHandler(
	    this.chatModel.id,
	    (reaction: ChatMessageReaction) => {
		this.messagePageViewModel.handleReaction(reaction);
	    },
	);
	chatModel.changeHandlerManager.setHandler(this.chatModel.id, this.settingsPageViewModel.updateData);

	// load
	this.loadPageSelection();
	this.resetColor();
	this.loadInfo();
	this.subscribeReadStatus();

	// keystrokes
	this.registerKeyStroke(CommonKeys.Home, this.close);
	this.registerKeyStroke("u", () =>
	    this.openPage(ChatPageTypes.Messages),
	);
	this.registerKeyStroke("i", () => this.openPage(ChatPageTypes.Tasks));
	this.registerKeyStroke("o", () =>
	    this.openPage(ChatPageTypes.Calendar),
	);
	this.registerKeyStroke(CommonKeys.Settings, () =>
	    this.openPage(ChatPageTypes.Settings),
	);

	// context
	this.chatListViewModel.selectedChat.subscribeSilent(
	    this.updateContexts,
	);
	this.selectedPage.subscribeSilent(this.updateContexts);
    }
}

// types
export enum ChatPageTypes {
    Settings = "settings",
	Messages = "messages",
	Tasks = "tasks",
	Calendar = "calendar",
}
