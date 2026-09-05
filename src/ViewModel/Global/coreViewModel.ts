import { v4 } from "uuid";
import * as React from "bloatless-react";
import { allTranslations, Translations } from "../../View/translations";
import { HandlerManager } from "../../Model/Utility/utility";
import StorageModel from "../../Model/Global/storageModel";
import SettingsModel from "../../Model/Global/settingsModel";
import FileTransferModel from "../../Model/Global/fileTransferModel";
import ConnectionModel from "../../Model/Global/connectionModel";
import ChatListModel from "../../Model/Chat/chatListModel";

export default class CoreViewModel {
    readonly BUILD = "Build 26.09.05.A";

    translations: Translations;

    // CONTEXT
    private contextStack = new Map<string, Context>();

    get contexts(): Context[] {
        return [...this.contextStack.values()];
    }
    get context(): Context | undefined {
        return this.contexts.pop();
    }
    set context(context: Context) {
        if (this.contextStack.has(context.contextId)) return;
        this.contextStack.set(context.contextId, context);
        history.pushState({ id: context.contextId }, "");
    }

    closeContext = (
        contextId: string,
        fromHistoryEvent: boolean = false,
    ): void => {
        if (
            !this.contexts
                .map((context) => context.contextId)
                .includes(contextId)
        )
            return;

        while (this.contexts.length > 0) {
            const currentContext: Context = this.context;
            currentContext.handleContextClose(fromHistoryEvent);
            this.contextStack.delete(currentContext.contextId);
            if (currentContext.contextId == contextId) break;
        }
    };

    handleKeyDown = (e: KeyboardEvent): void => {
        if (CoreViewModel.checkIsKeystroke(e) == false) return;
        e.preventDefault();
        const contexts: Context[] = this.contexts;
        while (contexts.length > 0) {
            const currentContext: Context | undefined = contexts.pop();
            if (!currentContext) contexts;
            const isHandled: boolean = currentContext.handleKeystroke(e);
            if (isHandled == true) break;
        }
    };

    // CHRON
    chronHandlerManager = new HandlerManager<void>();
    todayDate = new React.State<Date>(new Date());
    get unwrappedTodayDate() {
        return new Date(this.todayDate.value);
    }

    startChron = (): void => {
        setInterval(this.chronHandlerManager.trigger, 2000);
    };

    handleChron = (): void => {
        const newDate = new Date();
        if (this.unwrappedTodayDate.toDateString() == newDate.toDateString())
            return;
        this.todayDate.value = new Date();
    };

    // DRAG & DROP
    draggedObject: React.State<any> = new React.State<any>(undefined);

    // SUGGESTIONS
    // boards & tasks
    boardFilterStringSuggestions: React.ListState<string> =
        new React.ListState();

    taskCategorySuggestions: React.ListState<string> = new React.ListState();
    taskStatusSuggestions: React.ListState<string> = new React.ListState();

    // init
    constructor(
        public readonly storageModel: StorageModel,
        public readonly settingsModel: SettingsModel,
        public readonly connectionModel: ConnectionModel,
        public readonly chatListModel: ChatListModel,
        public readonly fileTransferModel: FileTransferModel,
    ) {
        this.translations =
            allTranslations[settingsModel.language] || allTranslations.en;

        document.body.addEventListener("keydown", this.handleKeyDown);

        window.onpopstate = () => {
            this.closeContext(this.context.contextId, true);
        };

        this.startChron();
        this.chronHandlerManager.setHandler(
            "core-view-model",
            this.handleChron,
        );
    }

    // util
    static checkIsKeystroke(e: KeyboardEvent): boolean {
        return (e.metaKey || e.altKey) && e.ctrlKey;
    }
}

export class Context {
    contextId = v4();
    keystrokes = new Map<string, () => void>();

    handleKeystroke = (e: KeyboardEvent): boolean => {
        const fn: (() => void) | undefined = this.keystrokes.get(
            e.key.toLowerCase(),
        );
        if (!fn) return false;
        fn();
        return true;
    };

    close = (): void => {};
    handleContextClose = (fromHistoryEvent: boolean): void => {};

    registerKeyStroke = (key: string, fn: () => void): void => {
        this.keystrokes.set(key, fn);
    };

    constructor(public contextDebugDescription: string) {}
}

export class ContextHost<T> extends Context {
    coreViewModel: CoreViewModel;
    contexts = new Map<T, Context>();
    currentContext = new React.State<Context | undefined>(undefined);

    get isOpen(): boolean {
        return false;
    }
    get contextSelection(): T | undefined {
        return undefined;
    }

    registerContext = (key: T, context: Context): void => {
        this.contexts.set(key, context);
    };

    closeCurrentContext = (): void => {
        if (this.currentContext.value) {
            this.coreViewModel.closeContext(
                this.currentContext.value.contextId,
            );
        }
        this.currentContext.value = undefined;
    };

    updateContexts = (): void => {
        if (this.isOpen == false) return;

        const selectedContext: Context | undefined = this.contexts.get(
            this.contextSelection,
        );
        if (!selectedContext) return;
        if (selectedContext != this.currentContext.value) {
            this.closeCurrentContext();
        }

        this.coreViewModel.context = selectedContext;
        this.currentContext.value = selectedContext;
    };
}
